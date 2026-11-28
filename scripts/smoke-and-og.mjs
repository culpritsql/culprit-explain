#!/usr/bin/env node
// Renders 8 dedicated 1200x630 OpenGraph cards + README banners and verifies all localized SEO routes in Chromium.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { copyFile, mkdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const explainRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playwrightModulePath = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = await import(playwrightModulePath);

const modeArg = process.argv[2] || "verify"; // "og" | "verify"
const distDir = path.join(explainRoot, "dist");
const publicDir = path.join(explainRoot, "public");
const ogDir = path.join(publicDir, "og");
const assetsDir = path.join(explainRoot, "assets");

const OG_CARDS = [
  {
    file: "home.png",
    eyebrow: "100% Client-Side Rust + WebAssembly · Zero Uploads",
    titleHtml: "Visualize SQL <em>Plans, Diffs &amp; Deadlocks</em>",
    sub: "Interactive flow diagrams, bottleneck fixes, cache vs disk I/O, and structural plan comparison in your browser.",
    pillRight: "167x faster",
    pillColor: "#4cbb84",
    pillBg: "rgba(76, 187, 132, 0.16)",
    tags: ["PostgreSQL", "SQL Server", "MySQL & MariaDB", "ClickHouse", "YugabyteDB", "SQLite"],
  },
  {
    file: "postgres.png",
    eyebrow: "PostgreSQL & TimescaleDB · EXPLAIN (ANALYZE, BUFFERS)",
    titleHtml: "PostgreSQL <em>EXPLAIN ANALYZE</em> Visualizer",
    sub: "Inspect slow operators, shared buffer cache hits vs disk reads, temp spills, and parallel worker skew.",
    pillRight: "8 KB Buffers",
    pillColor: "#6cb6ff",
    pillBg: "rgba(108, 182, 255, 0.16)",
    tags: ["FORMAT JSON", "ANALYZE Text", "Shared Buffers", "Temp Spills", "Index SQL"],
  },
  {
    file: "sql-server.png",
    eyebrow: "SQL Server & Azure SQL · Showplan XML",
    titleHtml: "SQL Server <em>.sqlplan</em> Viewer Online",
    sub: "Drop any SSMS or Azure Data Studio .sqlplan file to spot Key Lookups, spills, and missing indexes locally.",
    pillRight: ".sqlplan XML",
    pillColor: "#ffcf33",
    pillBg: "rgba(255, 207, 51, 0.16)",
    tags: ["Key Lookups", "Logical Reads", "Batch Mode", "Missing Indexes", "Zero Upload"],
  },
  {
    file: "mysql.png",
    eyebrow: "MySQL 8+ & MariaDB · JSON & Tree Plans",
    titleHtml: "MySQL &amp; MariaDB <em>EXPLAIN</em> Visualizer",
    sub: "Turn EXPLAIN FORMAT=JSON and EXPLAIN ANALYZE trees into clear visual flow diagrams and table rollups.",
    pillRight: "JSON + Tree",
    pillColor: "#ffcf33",
    pillBg: "rgba(255, 207, 51, 0.16)",
    tags: ["EXPLAIN ANALYZE", "FORMAT=JSON", "Filesort", "Full Scans", "MariaDB"],
  },
  {
    file: "clickhouse.png",
    eyebrow: "ClickHouse · MergeTree & EXPLAIN PLAN JSON",
    titleHtml: "ClickHouse <em>EXPLAIN PLAN</em> Visualizer",
    sub: "Inspect ReadFromMergeTree granule scans, parallel aggregation stages, sorting steps, and structural diffs.",
    pillRight: "EXPLAIN JSON",
    pillColor: "#ffcf33",
    pillBg: "rgba(255, 207, 51, 0.16)",
    tags: ["MergeTree", "Aggregating", "Sorting", "JSON Pipeline", "Zero Upload"],
  },
  {
    file: "yugabytedb.png",
    eyebrow: "Distributed SQL · YSQL & DocDB",
    titleHtml: "YugabyteDB <em>EXPLAIN &amp; DocDB</em> Visualizer",
    sub: "Analyze distributed execution plans with DocDB storage read/write requests, RPC latency, and catalog ops.",
    pillRight: "DocDB RPCs",
    pillColor: "#6cb6ff",
    pillBg: "rgba(108, 182, 255, 0.16)",
    tags: ["ANALYZE DIST", "Storage Reads", "RPC Latency", "Catalog Ops", "Index Scans"],
  },
  {
    file: "sqlite.png",
    eyebrow: "SQLite · LibSQL · Turso",
    titleHtml: "SQLite <em>EXPLAIN QUERY PLAN</em> Viewer",
    sub: "Spot full table scans, temporary ORDER BY B-trees, and covering index searches instantly in WebAssembly.",
    pillRight: "B-Tree Flow",
    pillColor: "#4cbb84",
    pillBg: "rgba(76, 187, 132, 0.16)",
    tags: ["SCAN vs SEARCH", "Temp B-Tree", "Covering Index", "SQLite CLI", "100% Local"],
  },
  {
    file: "compare.png",
    eyebrow: "Before vs After · Structural SQL Plan Diff",
    titleHtml: "Compare SQL Plans <em>Side-by-Side</em>",
    sub: "Measure exact runtime speedup, highlight Seq Scan to Index Scan flips, and verify index changes.",
    pillRight: "167x faster",
    pillColor: "#4cbb84",
    pillBg: "rgba(76, 187, 132, 0.16)",
    tags: ["Speedup Verdict", "Access Flips", "Why It Changed", "Synced Zoom", "8 Engines"],
  },
  {
    file: "deadlock.png",
    eyebrow: "SQL Server XML · PostgreSQL Log · MySQL InnoDB",
    titleHtml: "SQL <em>Deadlock Graph</em> &amp; Root-Cause",
    sub: "Interactive lock-wait cycle SVG diagrams, victim rollback badges, and ordered remediation steps.",
    pillRight: "Lock Cycle",
    pillColor: "#f06a51",
    pillBg: "rgba(240, 106, 81, 0.16)",
    tags: ["SQL Server .xdl", "Postgres Log", "InnoDB Status", "Victim SPID", "Fix SQL"],
  },
  {
    file: "extended-events.png",
    eyebrow: "SQL Server & Azure SQL · Binary .xel Without SSMS",
    titleHtml: "Extended Events <em>.xel</em> Viewer Online",
    sub: "Open binary system_health*.xel captures and RingBufferTarget XML on macOS, Linux, or Windows in WebAssembly.",
    pillRight: ".xel + XML",
    pillColor: "#ffcf33",
    pillBg: "rgba(255, 207, 51, 0.16)",
    tags: ["Binary .xel", "system_health", "Timeouts", "Deadlocks", "No SSMS"],
  },
];

async function renderOgAndHero(browser) {
  await mkdir(ogDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });

  const ogCtx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const card of OG_CARDS) {
    const ogPage = await ogCtx.newPage();
    await ogPage.setContent(`<!doctype html>
    <html><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; margin: 0; }
      body {
        width: 1200px; height: 630px; overflow: hidden;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 74px;
        background-color: #0f0e0c;
        background-image:
          radial-gradient(circle at 18% 45%, rgba(255, 207, 51, 0.16), transparent 48%),
          radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
        background-size: 100% 100%, 24px 24px;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        color: #f2f0ea;
      }
      .left { max-width: 605px; }
      .pill {
        display: inline-flex; align-items: center; gap: 9px;
        padding: 6px 14px; border-radius: 999px;
        background: #1b1a17; border: 1px solid #2e2c26;
        font-size: 13.5px; font-weight: 600; color: #c5c2b9;
        margin-bottom: 22px;
      }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #4cbb84; }
      .brand { display: flex; align-items: center; gap: 15px; margin-bottom: 18px; }
      .mark {
        width: 52px; height: 52px; border-radius: 13px; background: #ffcf33;
        display: grid; place-items: center;
      }
      .brand span { font-size: 25px; font-weight: 700; letter-spacing: -0.02em; }
      h1 { font-size: 50px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.09; }
      h1 em { font-style: normal; color: #ffcf33; }
      p { margin-top: 18px; font-size: 20px; color: #a8a49b; line-height: 1.45; }
      .engines { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 26px; }
      .eng {
        padding: 6px 12px; border-radius: 8px;
        background: #181714; border: 1px solid #2b2923;
        font-size: 13px; font-weight: 600; color: #dcd9d0;
      }
      .right {
        position: relative; width: 404px; height: 360px; flex: none;
        border-radius: 18px; background: #171613; border: 1px solid #2c2a24;
        padding: 22px;
        box-shadow: 0 32px 80px rgba(0,0,0,0.65);
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .r-head {
        display: flex; justify-content: space-between; align-items: center;
        padding-bottom: 14px; border-bottom: 1px solid #282621;
        font-size: 13px; font-weight: 600; color: #a8a49b;
      }
      .speedup {
        padding: 4px 10px; border-radius: 999px;
        background: ${card.pillBg}; color: ${card.pillColor}; font-weight: 700;
        font-family: ui-monospace, "SF Mono", monospace; font-size: 12px;
      }
      .dag { position: relative; height: 196px; margin: 12px 0; }
      .card {
        position: absolute; padding: 11px 13px; border-radius: 11px;
        background: #1f1e1a; border: 1px solid #323029;
      }
      .card.top { width: 210px; left: 75px; top: 4px; }
      .card.hot { width: 172px; left: 0; top: 114px; border-color: #ea5f45; }
      .card.idx { width: 172px; right: 0; top: 114px; border-color: #4cbb84; }
      .ct { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
      .cs { font-family: ui-monospace, "SF Mono", monospace; font-size: 11px; color: #9c988e; margin-top: 4px; }
      .r-foot {
        display: flex; justify-content: space-between; font-size: 12px; color: #9c988e;
        padding-top: 12px; border-top: 1px solid #282621;
        font-family: ui-monospace, "SF Mono", monospace;
      }
    </style></head><body>
      <div class="left">
        <div class="pill"><span class="dot"></span> ${card.eyebrow}</div>
        <div class="brand">
          <svg width="52" height="52" viewBox="0 0 460 460" style="display:block;flex:none">
            <rect width="460" height="460" rx="102" fill="#ffcf33"/>
            <path d="M 283.33 301.78 A 106.25 106.25 0 1 1 283.33 158.22" fill="none" stroke="#1b1a18" stroke-width="67.5" stroke-linecap="butt"/>
            <polygon points="340.5,179 391.5,230 340.5,281 289.5,230" fill="#e0484e"/>
          </svg>
          <span>Culprit Explain</span>
        </div>
        <h1>${card.titleHtml}</h1>
        <p>${card.sub}</p>
        <div class="engines">
          ${card.tags.map((t) => `<span class="eng">${t}</span>`).join("")}
        </div>
      </div>
      <div class="right">
        <div class="r-head">
          <span>explain.culpritsql.com</span>
          <span class="speedup">${card.pillRight}</span>
        </div>
        <div class="dag">
          <svg viewBox="0 0 360 196" style="position:absolute;inset:0;width:100%;height:100%" fill="none">
            <path d="M 86 114 C 86 86, 158 86, 158 62" stroke="#ea5f45" stroke-width="2.4"/>
            <path d="M 274 114 C 274 86, 202 86, 202 62" stroke="#4cbb84" stroke-width="2.2"/>
          </svg>
          <div class="card top">
            <div class="ct"><span>Nested Loop</span><span style="color:#a8a49b">1.8 ms</span></div>
            <div class="cs">50 rows · 254 shared hits</div>
          </div>
          <div class="card hot">
            <div class="ct"><span>Seq Scan</span><span style="color:#ea5f45">78%</span></div>
            <div class="cs">orders · 18 MB spill</div>
          </div>
          <div class="card idx">
            <div class="ct"><span>Index Scan</span><span style="color:#4cbb84">0.6 ms</span></div>
            <div class="cs">ix_orders_status</div>
          </div>
        </div>
        <div class="r-foot">
          <span>culpritsql.com</span>
          <span>MIT Open Source</span>
        </div>
      </div>
    </body></html>`);
    await ogPage.screenshot({ path: path.join(ogDir, card.file) });
    await ogPage.close();
  }
  await ogCtx.close();
  await copyFile(path.join(ogDir, "home.png"), path.join(publicDir, "og.png"));

  // Render crisp 2x README hero banners (hero-dark.png & hero-light.png) with the new Culprit mark
  const heroCtx = await browser.newContext({ viewport: { width: 1280, height: 288 }, deviceScaleFactor: 2 });
  for (const isDark of [true, false]) {
    const hp = await heroCtx.newPage();
    await hp.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; margin: 0; }
      body {
        width: 1280px; height: 288px; overflow: hidden;
        border-radius: 18px;
        border: 1px solid ${isDark ? "#26241f" : "#e5e1d6"};
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 64px;
        background-color: ${isDark ? "#0f0e0c" : "#fbfaf6"};
        background-image:
          radial-gradient(circle at 12% 50%, ${isDark ? "rgba(255, 207, 51, 0.14)" : "rgba(255, 207, 51, 0.22)"}, transparent 45%),
          radial-gradient(${isDark ? "rgba(255,255,255,0.06)" : "rgba(27,26,24,0.07)"} 1px, transparent 1px);
        background-size: 100% 100%, 22px 22px;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        color: ${isDark ? "#f2f0ea" : "#181715"};
      }
      .left { display: flex; align-items: center; gap: 28px; max-width: 700px; }
      .pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 5px 12px; border-radius: 999px;
        background: ${isDark ? "#1b1a17" : "#f1eee5"};
        border: 1px solid ${isDark ? "#2e2c26" : "#e0dbc9"};
        font-size: 12.5px; font-weight: 600;
        color: ${isDark ? "#c5c2b9" : "#4d4a43"};
        margin-bottom: 12px;
      }
      .dot { width: 7px; height: 7px; border-radius: 50%; background: #4cbb84; }
      h1 { font-size: 40px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.08; }
      h1 span { font-weight: 600; color: ${isDark ? "#9c988e" : "#6f6b62"}; }
      p { margin-top: 10px; font-size: 16.5px; line-height: 1.45; color: ${isDark ? "#a5a198" : "#57534b"}; max-width: 560px; }
      .right { display: flex; flex-direction: column; gap: 10px; width: 386px; flex: none; }
      .row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 16px; border-radius: 12px;
        background: ${isDark ? "#171613" : "#ffffff"};
        border: 1px solid ${isDark ? "#2a2822" : "#e5e1d6"};
        box-shadow: ${isDark ? "0 8px 24px rgba(0,0,0,0.35)" : "0 4px 14px rgba(24,23,21,0.04)"};
      }
      .rt { font-size: 14px; font-weight: 700; }
      .rs { font-size: 12px; color: ${isDark ? "#949086" : "#6f6b62"}; margin-top: 2px; }
      .tag {
        padding: 4px 10px; border-radius: 999px;
        font-family: ui-monospace, "SF Mono", monospace; font-size: 11.5px; font-weight: 700;
      }
      .t-amber { background: ${isDark ? "rgba(255,207,51,0.15)" : "rgba(180,132,0,0.12)"}; color: ${isDark ? "#ffcf33" : "#8a6200"}; }
      .t-green { background: rgba(76,187,132,0.15); color: ${isDark ? "#4cbb84" : "#1c7c4d"}; }
      .t-coral { background: rgba(240,106,81,0.15); color: ${isDark ? "#f06a51" : "#c03c24"}; }
    </style></head><body>
      <div class="left">
        <svg width="84" height="84" viewBox="0 0 460 460" style="display:block;flex:none;filter:drop-shadow(0 12px 28px rgba(0,0,0,${isDark ? "0.45" : "0.12"}))">
          <rect width="460" height="460" rx="102" fill="#ffcf33"/>
          <path d="M 283.33 301.78 A 106.25 106.25 0 1 1 283.33 158.22" fill="none" stroke="#1b1a18" stroke-width="67.5" stroke-linecap="butt"/>
          <polygon points="340.5,179 391.5,230 340.5,281 289.5,230" fill="#e0484e"/>
        </svg>
        <div>
          <div class="pill"><span class="dot"></span> 100% Client-Side WebAssembly</div>
          <h1><span>explain.</span>culpritsql.com</h1>
          <p>Online SQL execution plan visualizer, structural plan comparator, deadlock cycle graph &amp; Extended Events (.xel) inspector.</p>
        </div>
      </div>
      <div class="right">
        <div class="row">
          <div><div class="rt">Execution Plan Explorer</div><div class="rs">Diagram · Tree · Ops · Tables · Raw</div></div>
          <span class="tag t-amber">8 Engines</span>
        </div>
        <div class="row">
          <div><div class="rt">Side-by-Side Plan Diff</div><div class="rs">Before vs After structural comparison</div></div>
          <span class="tag t-green">167x faster</span>
        </div>
        <div class="row">
          <div><div class="rt">Deadlock &amp; .xel Analyzer</div><div class="rs">SQL Server · PostgreSQL · InnoDB</div></div>
          <span class="tag t-coral">Lock Cycle</span>
        </div>
      </div>
    </body></html>`);
    await hp.screenshot({
      path: path.join(assetsDir, isDark ? "hero-dark.png" : "hero-light.png"),
      omitBackground: true,
    });
    await hp.close();
  }
  await heroCtx.close();
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const browser = await chromium.launch();
try {
  if (modeArg === "og") {
    await renderOgAndHero(browser);
    console.log(`Generated ${OG_CARDS.length} OpenGraph social preview images in public/og/`);
  } else {
    const canonicalDist = await realpath(distDir);
    const server = createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
        if (urlPath.endsWith("/")) urlPath += "index.html";
        const resolved = await realpath(path.join(distDir, urlPath.slice(1)));
        if (!resolved.startsWith(`${canonicalDist}${path.sep}`) || !(await stat(resolved)).isFile()) {
          throw new Error("not found");
        }
        res.writeHead(200, { "Content-Type": contentTypes[path.extname(resolved)] ?? "application/octet-stream" });
        res.end(await readFile(resolved));
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const origin = `http://127.0.0.1:${server.address().port}`;

    try {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      const externalRequests = [];
      const failedResponses = [];
      const pageErrors = [];
      const consoleErrors = [];

      await page.route("**/*", async (route) => {
        const u = route.request().url();
        if (u === "https://plausible.io/js/pa-jwbltq4g-1FwajFrFY04z.js") {
          await route.fulfill({
            status: 200,
            contentType: "application/javascript; charset=utf-8",
            body: "window.__plausibleLoaded = true;",
          });
        } else if (u === "https://plausible.io/api/event") {
          await route.fulfill({ status: 202, body: "ok" });
        } else if (!u.startsWith("data:") && !u.startsWith("blob:") && new URL(u).origin !== origin) {
          externalRequests.push(u);
          await route.abort();
        } else {
          await route.continue();
        }
      });
      page.on("response", (resp) => {
        if (resp.status() >= 400) {
          failedResponses.push(`${resp.status()} ${resp.url()}`);
        }
      });
      page.on("pageerror", (err) => pageErrors.push(String(err)));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      const sampleRoutes = [
        ["/", "en", "og/home.png"],
        ["/postgres/", "en", "og/postgres.png"],
        ["/sql-server/", "en", "og/sql-server.png"],
        ["/clickhouse/", "en", "og/clickhouse.png"],
        ["/compare/", "en", "og/compare.png"],
        ["/deadlock/", "en", "og/deadlock.png"],
        ["/extended-events/", "en", "og/extended-events.png"],
        ["/zh/", "zh-Hans", "og/home.png"],
        ["/zh/postgres/", "zh-Hans", "og/postgres.png"],
        ["/zh/clickhouse/", "zh-Hans", "og/clickhouse.png"],
        ["/ja/", "ja", "og/home.png"],
        ["/ja/sql-server/", "ja", "og/sql-server.png"],
        ["/ko/deadlock/", "ko", "og/deadlock.png"],
        ["/ru/compare/", "ru", "og/compare.png"],
        ["/de/", "de", "og/home.png"],
        ["/es/", "es", "og/home.png"],
        ["/fr/", "fr", "og/home.png"],
        ["/pt/", "pt-BR", "og/home.png"],
      ];

      for (const [r, expectedLang, expectedOg] of sampleRoutes) {
        const resp = await page.goto(`${origin}${r}`);
        assert.equal(resp?.status(), 200, `Expected HTTP 200 for ${r}`);
        const htmlLang = await page.locator("html").getAttribute("lang");
        assert.equal(htmlLang, expectedLang, `Expected lang=${expectedLang} on ${r}`);
        const hreflangs = await page.locator('link[rel="alternate"][hreflang]').count();
        assert.equal(hreflangs, 10, `Expected 10 hreflang links (9 locales + x-default) on ${r}`);
        const ogImg = await page.locator('meta[property="og:image"]').getAttribute("content");
        assert(ogImg && ogImg.endsWith(expectedOg), `Expected og:image ending with ${expectedOg} on ${r}, got ${ogImg}`);

        // Verify the OG image file itself exists in dist/
        const ogResp = await page.request.get(`${origin}/${expectedOg}`);
        assert.equal(ogResp.status(), 200, `Missing built OG image ${expectedOg}`);
      }

      // Verify GitHub org icon in header + Plausible analytics initialization under CSP
      await page.goto(`${origin}/`);
      await page.waitForSelector(".ex-wasm-pill.ready", { timeout: 10000 });
      const plausibleOk = await page.evaluate(
        () => typeof window.plausible === "function" && window.__plausibleLoaded === true,
      );
      assert.equal(plausibleOk, true, "Plausible analytics script and inline init must execute cleanly under CSP");
      const headerGhOrg = page.locator('header a[href="https://github.com/culpritsql"]');
      assert.equal(await headerGhOrg.isVisible(), true, "Header GitHub org icon link must be visible");

      // Verify top mode tabs are dead-centered relative to viewport width
      const tabsBox = await page.locator(".ex-mode-tabs").boundingBox();
      assert(tabsBox, "Missing .ex-mode-tabs bounding box");
      const tabsCenterX = tabsBox.x + tabsBox.width / 2;
      assert(
        Math.abs(tabsCenterX - 1280 / 2) <= 2,
        `Expected .ex-mode-tabs to be centered at 640px, got ${tabsCenterX}px`,
      );

      // Verify FAQs are collapsed by default
      const openFaqs = await page.locator("details.ex-faq-item[open]").count();
      assert.equal(openFaqs, 0, "FAQ items must be collapsed by default");

      assert.equal(
        await page.locator('footer .ex-shield-badge[href="https://www.npmjs.com/package/@culpritsql/plans"]').count(),
        1,
        "Footer must render shield badge for @culpritsql/plans on npm",
      );
      assert.equal(
        await page.locator('footer .ex-shield-badge[href="https://www.npmjs.com/package/@culpritsql/plan-viewer"]').count(),
        1,
        "Footer must render shield badge for @culpritsql/plan-viewer on npm",
      );

      for (const expectedHref of [
        "https://culpritsql.com",
        "https://github.com/culpritsql",
        "https://github.com/culpritsql/culprit-sql-studio",
        "https://github.com/culpritsql/culprit-plans",
        "https://github.com/culpritsql/culprit-plan-viewer",
        "https://github.com/culpritsql/culprit-explain",
      ]) {
        const count = await page.locator(`a[href="${expectedHref}"]`).count();
        assert(count >= 1, `Missing link to ${expectedHref}`);
      }

      // Click EVERY SINGLE sample card (0..N-1) and verify zero parse errors + viewer mounts
      const sampleCount = await page.locator(".ex-sample-card").count();
      assert(sampleCount >= 5, `Expected at least 5 sample cards, got ${sampleCount}`);
      for (let i = 0; i < sampleCount; i++) {
        await page.locator(".ex-sample-card").nth(i).click();
        await page.waitForTimeout(80);
        const errCount = await page.locator(".ex-error-banner").count();
        assert.equal(errCount, 0, `Sample card #${i} triggered a parse error!`);
        const viewerRendered = await page
          .locator(".culprit-pv .plan-card, .culprit-pv .cmp-verdict, .culprit-pv .dl-graph svg")
          .count();
        assert(viewerRendered >= 1, `Sample card #${i} did not render a viewer!`);
        await page.locator(".ex-active-left button").first().click();
        await page.waitForSelector(".ex-sample-card");
      }

      // Verify interactive language switcher in top header
      await page.locator(".ex-lang-btn").click();
      await page.locator('.ex-lang-menu a[href="/ja/"]').click();
      assert.equal(new URL(page.url()).pathname, "/ja/", "Language switcher did not navigate to /ja/");
      const jaH1 = await page.locator("h1").first().textContent();
      assert(jaH1 && jaH1.includes("SQL"), "Japanese H1 did not render");
      await page.goto(`${origin}/`);
      await page.waitForSelector(".ex-wasm-pill.ready");

      // Refresh README studio preview screenshots (clean history first) + full-page audit shots
      for (const theme of ["dark", "light"]) {
        await page.evaluate((t) => {
          document.documentElement.dataset.theme = t;
          window.localStorage.setItem("culprit-explain:theme", t);
          window.localStorage.removeItem("culprit-explain:history:v1");
        }, theme);
        await page.goto(`${origin}/`);
        await page.waitForSelector(".ex-wasm-pill.ready");
        await page.setViewportSize({ width: 1280, height: 860 });
        await page.waitForTimeout(80);
        await page.screenshot({ path: path.join(assetsDir, `preview-studio-${theme}.png`) });
      }

      assert.deepEqual(externalRequests, [], `Unexpected external requests: ${externalRequests.join(", ")}`);
      assert.deepEqual(failedResponses, [], `Failed HTTP responses: ${failedResponses.join(", ")}`);
      assert.deepEqual(pageErrors, [], `Page errors: ${pageErrors.join("; ")}`);
      assert.deepEqual(consoleErrors, [], `Console errors: ${consoleErrors.join("; ")}`);

      console.log(
        JSON.stringify(
          {
            status: "PASS",
            localizedRoutesChecked: sampleRoutes.length,
            hreflangClusterSize: 10,
            ogImagesVerified: OG_CARDS.length,
            externalRequests: 0,
          },
          null,
          2,
        ),
      );
      await ctx.close();
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
} finally {
  await browser.close();
}
