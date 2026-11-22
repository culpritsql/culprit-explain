#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const ssrEntryPath = path.join(root, "dist-ssr/entry-prerender.js");

function normalizeBasePath(raw) {
  if (!raw || raw === "/") return "/";
  const lead = raw.startsWith("/") ? raw : `/${raw}`;
  return lead.endsWith("/") ? lead : `${lead}/`;
}

const basePath = normalizeBasePath(process.env.SITE_BASE_PATH);
const rawBaseUrl = (process.env.SITE_BASE_URL || "https://explain.culpritsql.com").replace(/\/+$/, "");
const domainHost = new URL(`${rawBaseUrl}/`).host;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const template = await readFile(path.join(distDir, "index.html"), "utf8");
const ssrMod = await import(pathToFileURL(ssrEntryPath).href);
const { BUNDLES, LOCALES, ROUTES, renderRouteHtml, slugModeAndEngine } = ssrMod;

const today = new Date().toISOString().slice(0, 10);
const SLUGS = ROUTES.map((r) => r.slug);

function canonicalFor(localeCode, slug) {
  const langSeg = localeCode === "en" ? "" : `${localeCode}/`;
  const slugSeg = slug ? `${slug}/` : "";
  return `${rawBaseUrl}/${langSeg}${slugSeg}`;
}

function buildJsonLd(locSpec, slug, routeCopy, canonicalUrl, ogImageUrl) {
  const homeUrl = canonicalFor(locSpec.code, "");
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${rawBaseUrl}/#website`,
      url: `${rawBaseUrl}/`,
      name: "Culprit Explain",
      inLanguage: locSpec.htmlLang,
      sameAs: [
        "https://culpritsql.com/",
        "https://github.com/culpritsql/culprit-sql-studio",
        "https://github.com/culpritsql/culprit-plans",
        "https://github.com/culpritsql/culprit-plan-viewer",
        "https://github.com/culpritsql/culprit-explain",
      ],
      publisher: {
        "@type": "Organization",
        name: "Culprit SQL",
        url: "https://culpritsql.com/",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${canonicalUrl}#app`,
      name: slug ? routeCopy.h1 : "Culprit Explain",
      url: canonicalUrl,
      inLanguage: locSpec.htmlLang,
      description: routeCopy.description,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "SQL Execution Plan & Deadlock Analyzer",
      operatingSystem: "Any (WebAssembly browser runtime)",
      browserRequirements: "Requires JavaScript and WebAssembly",
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      image: ogImageUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ];

  if (slug) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Culprit Explain",
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: routeCopy.navLabel,
          item: canonicalUrl,
        },
      ],
    });
  }

  if (routeCopy.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      inLanguage: locSpec.htmlLang,
      mainEntity: routeCopy.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

const PLAUSIBLE_SRC = "https://plausible.io/js/pa-jwbltq4g-1FwajFrFY04z.js";
const PLAUSIBLE_INLINE =
  "\n  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};\n  plausible.init()\n";

function buildHeadHtml(locSpec, slug, routeCopy, canonicalUrl, robots = "index, follow, max-image-preview:large") {
  const { ogImage } = slugModeAndEngine(slug);
  const ogImageUrl = `${rawBaseUrl}/${ogImage}`;
  const jsonLd = buildJsonLd(locSpec, slug, routeCopy, canonicalUrl, ogImageUrl);
  const ldHash = createHash("sha256").update(jsonLd).digest("base64");
  const plausibleHash = createHash("sha256").update(PLAUSIBLE_INLINE).digest("base64");

  const csp = [
    "default-src 'none'",
    `script-src 'self' 'wasm-unsafe-eval' ${PLAUSIBLE_SRC} 'sha256-${ldHash}' 'sha256-${plausibleHash}'`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self' https://plausible.io/api/event",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-src 'none'",
  ].join("; ");

  const hreflangLinks = [
    ...LOCALES.map(
      (alt) =>
        `<link rel="alternate" hreflang="${escapeHtml(alt.hreflang)}" href="${escapeHtml(canonicalFor(alt.code, slug))}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalFor("en", slug))}" />`,
  ];

  const ogAltLocales = LOCALES.filter((alt) => alt.code !== locSpec.code).map(
    (alt) => `<meta property="og:locale:alternate" content="${escapeHtml(alt.ogLocale)}" />`,
  );

  return [
    `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}" />`,
    `<title>${escapeHtml(routeCopy.title)}</title>`,
    `<meta name="description" content="${escapeHtml(routeCopy.description)}" />`,
    `<meta name="robots" content="${escapeHtml(robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    ...hreflangLinks,
    `<link rel="manifest" href="${escapeHtml(`${basePath}site.webmanifest`)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Culprit Explain" />`,
    `<meta property="og:locale" content="${escapeHtml(locSpec.ogLocale)}" />`,
    ...ogAltLocales,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(routeCopy.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(routeCopy.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(routeCopy.h1)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:domain" content="${escapeHtml(domainHost)}" />`,
    `<meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(routeCopy.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(routeCopy.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(routeCopy.h1)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    `<!-- Privacy-friendly analytics by Plausible -->`,
    `<script async src="${PLAUSIBLE_SRC}"></script>`,
    `<script>${PLAUSIBLE_INLINE}</script>`,
  ].join("\n  ");
}

let pageCount = 0;
const sitemapEntries = [];

for (const locSpec of LOCALES) {
  const bundle = BUNDLES[locSpec.code];
  for (const slug of SLUGS) {
    const langSeg = locSpec.code === "en" ? "" : `${locSpec.code}/`;
    const slugSeg = slug ? `${slug}/` : "";
    const fullPathname = `${basePath}${langSeg}${slugSeg}`;
    const canonicalUrl = canonicalFor(locSpec.code, slug);
    const routeCopy = bundle.routes[slug];

    const ssrHtml = renderRouteHtml(fullPathname, basePath);
    const headHtml = buildHeadHtml(locSpec, slug, routeCopy, canonicalUrl);

    const pageHtml = template
      .replace('<html lang="en">', `<html lang="${escapeHtml(locSpec.htmlLang)}">`)
      .replace("<!--__SEO_HEAD__-->", headHtml)
      .replace("<!--__SSR_OUTLET__-->", ssrHtml);

    const outDir = path.join(distDir, langSeg, slugSeg);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), pageHtml, "utf8");
    pageCount += 1;

    const xhtmlAlternates = [
      ...LOCALES.map(
        (alt) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeHtml(alt.hreflang)}" href="${escapeHtml(canonicalFor(alt.code, slug))}" />`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalFor("en", slug))}" />`,
    ].join("\n");

    sitemapEntries.push(
      `  <url>\n    <loc>${escapeHtml(canonicalUrl)}</loc>\n    <lastmod>${today}</lastmod>\n${xhtmlAlternates}\n  </url>`,
    );
  }
}

// 404.html fallback (noindex so crawlers never index unknown URLs)
const enSpec = LOCALES[0];
const homeCopy = BUNDLES.en.routes[""];
const notFoundHtml = template
  .replace("<!--__SEO_HEAD__-->", buildHeadHtml(enSpec, "", homeCopy, `${rawBaseUrl}/`, "noindex, follow"))
  .replace("<!--__SSR_OUTLET__-->", renderRouteHtml(basePath, basePath));
await writeFile(path.join(distDir, "404.html"), notFoundHtml, "utf8");

// Multilingual sitemap.xml with xhtml:link hreflang clusters
const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...sitemapEntries,
  "</urlset>",
  "",
].join("\n");
await writeFile(path.join(distDir, "sitemap.xml"), sitemapXml, "utf8");

const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${rawBaseUrl}/sitemap.xml\n`;
await writeFile(path.join(distDir, "robots.txt"), robotsTxt, "utf8");

const llmsTxt = [
  "# Culprit Explain",
  "",
  "> Free, open-source, 100% client-side SQL execution plan visualizer, side-by-side plan comparator, and deadlock cycle analyzer powered by Rust and WebAssembly.",
  "",
  `- Live web app: ${rawBaseUrl}/`,
  "- Main website (Culprit SQL Studio desktop app, CLI & MCP server): https://culpritsql.com/",
  "- GitHub organization: https://github.com/culpritsql",
  "- Culprit SQL Studio repository: https://github.com/culpritsql/culprit-sql-studio",
  "- @culpritsql/plans repository: https://github.com/culpritsql/culprit-plans",
  "- @culpritsql/plan-viewer repository: https://github.com/culpritsql/culprit-plan-viewer",
  "- Culprit Explain repository: https://github.com/culpritsql/culprit-explain",
  "",
  "## Tools & Routes",
  ...SLUGS.map((s) => `- [${BUNDLES.en.routes[s].navLabel}](${canonicalFor("en", s)}): ${BUNDLES.en.routes[s].description}`),
  "",
  "## Supported Languages",
  ...LOCALES.map((l) => `- [${l.nativeLabel} (${l.hreflang})](${canonicalFor(l.code, "")})`),
  "",
].join("\n");
await writeFile(path.join(distDir, "llms.txt"), llmsTxt, "utf8");

const manifestJson = JSON.stringify(
  {
    name: "Culprit Explain",
    short_name: "Explain",
    description: homeCopy.description,
    start_url: basePath,
    scope: basePath,
    display: "standalone",
    background_color: "#0f0e0c",
    theme_color: "#ffcf33",
    icons: [
      { src: `${basePath}favicon.svg`, sizes: "any", type: "image/svg+xml" },
      { src: `${basePath}apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  },
  null,
  2,
);
await writeFile(path.join(distDir, "site.webmanifest"), `${manifestJson}\n`, "utf8");
await writeFile(path.join(distDir, ".nojekyll"), "", "utf8");

await rm(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log(
  `Pre-rendered ${pageCount} localized SEO pages (${LOCALES.length} languages x ${SLUGS.length} routes) into dist/`,
);
