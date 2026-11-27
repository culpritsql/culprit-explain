import {
  bindPlanViewerClipboard,
  DeadlockViewer,
  ExtendedEventsViewer,
  PlanDiffViewer,
  PlanViewer,
} from "@culpritsql/plan-viewer";
import type { Deadlock, Engine, ExtendedEventsBatch, Plan, PlanDiff } from "@culpritsql/plans";
import "@culpritsql/plan-viewer/styles.css";
import {
  ArrowLeft,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ClipboardPaste,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  FolderOpen,
  GitCompare,
  Globe,
  Lock,
  Moon,
  Package,
  Pin,
  Play,
  Plus,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { type DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import pkg from "../package.json";
import {
  clearHistory,
  deleteHistoryEntry,
  type HistoryEntry,
  loadHistory,
  quickFingerprint,
  saveHistoryEntry,
  togglePinHistory,
} from "./history";
import {
  buildLocalizedPath,
  BUNDLES,
  LOCALES,
  type LocaleCode,
  parsePathnameLocaleAndSlug,
  type RouteSlug,
  slugModeAndEngine,
} from "./i18n";
import {
  CAPTURE_GUIDES,
  DEADLOCK_GUIDES,
  type EngineFilter,
  ROUTES,
  type StudioMode,
} from "./routes";
import { type SampleCase, SAMPLES } from "./samples";
import {
  copyTextToClipboard,
  decodeShareHash,
  encodeShareHash,
  isValidSharedEventsBatch,
  redactPayloadText,
  scrubSqlLiterals,
  type SharePayloadV1,
} from "./share";
import { type CoreError, ensurePlansWasm, extractCoreError } from "./wasm-client";

export interface AppProps {
  initialPathname?: string;
  basePath?: string;
}

type ThemePref = "system" | "dark" | "light";

type ActiveResult =
  | { kind: "plan"; plan: Plan; title: string }
  | { kind: "compare"; a: Plan; b: Plan; diff: PlanDiff; nameA: string; nameB: string }
  | { kind: "deadlock"; deadlocks: Deadlock[]; index: number; title: string }
  | { kind: "events"; batch: ExtendedEventsBatch; title: string };

function isExtendedEventsXml(text: string): boolean {
  const body = text.replace(/^\uFEFF?(?:<\?xml[^>]*\?>\s*)?/i, "").trimStart();
  return /^<(?:events|RingBufferTarget|event\b)/i.test(body);
}

function hasXelMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x5a && bytes[1] === 0x37 && bytes[2] === 0xab && bytes[3] === 0xef;
}

function decodeTextBytes(bytes: Uint8Array): string {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

const ENGINE_PILLS: Array<{ id: EngineFilter; labelKey?: "auto"; label: string; slug: RouteSlug; icon?: string }> = [
  { id: "auto", labelKey: "auto", label: "Auto-detect", slug: "" },
  { id: "postgres", label: "PostgreSQL", slug: "postgres", icon: "providers/postgres.svg" },
  { id: "mssql", label: "SQL Server", slug: "sql-server", icon: "providers/mssql.svg" },
  { id: "mysql", label: "MySQL & MariaDB", slug: "mysql", icon: "providers/mysql.svg" },
  { id: "yugabyte", label: "YugabyteDB", slug: "yugabytedb", icon: "providers/yugabyte.svg" },
  { id: "sqlite", label: "SQLite", slug: "sqlite", icon: "providers/sqlite.svg" },
];

const ENGINE_META: Record<Engine, { label: string; icon: string; slug: RouteSlug }> = {
  postgres: { label: "PostgreSQL", icon: "providers/postgres.svg", slug: "postgres" },
  mssql: { label: "SQL Server", icon: "providers/mssql.svg", slug: "sql-server" },
  mysql: { label: "MySQL", icon: "providers/mysql.svg", slug: "mysql" },
  yugabyte: { label: "YugabyteDB", icon: "providers/yugabyte.svg", slug: "yugabytedb" },
  sqlite: { label: "SQLite", icon: "providers/sqlite.svg", slug: "sqlite" },
};

const ROUTE_SLUGS: RouteSlug[] = ["", "postgres", "sql-server", "mysql", "yugabytedb", "sqlite", "compare", "deadlock"];

function joinBase(basePath: string, rel: string): string {
  const cleanBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const cleanRel = rel.replace(/^\/+/, "");
  return `${cleanBase}${cleanRel}`;
}

function countPlanNodes(plan: Plan): number {
  let count = 0;
  const walk = (node: Plan["root"]) => {
    count += 1;
    for (const child of node.children) walk(child);
  };
  walk(plan.root);
  return count;
}

function formatMs(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) return null;
  if (ms < 1) return `${ms.toFixed(2)} ms`;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function relativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

function GitHubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width={size} height={size}>
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

function NpmIcon({ size = 12 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width={size} height={size}>
      <path fill="#cb3837" d="M0 0h16v16H0z" />
      <path fill="#ffffff" d="M3 3h10v10h-2V5H8v8H3z" />
    </svg>
  );
}

function ShieldBadge({
  href,
  label,
  value,
  color,
  textColor = "#181715",
  icon,
}: {
  href: string;
  label: string;
  value: string;
  color: string;
  textColor?: string;
  icon?: "npm" | "github";
}) {
  return (
    <a href={href} target="_blank" rel="noopener" className="ex-shield-badge">
      <span className="ex-shield-label">
        {icon === "npm" && <NpmIcon size={11} />}
        {icon === "github" && <GitHubIcon size={11} />}
        <span>{label}</span>
      </span>
      <span className="ex-shield-value" style={{ backgroundColor: color, color: textColor }}>
        {value}
      </span>
    </a>
  );
}

export function App({ initialPathname = "/", basePath = import.meta.env.BASE_URL || "/" }: AppProps) {
  const initialParsed = useMemo(
    () => parsePathnameLocaleAndSlug(initialPathname, basePath),
    [initialPathname, basePath],
  );
  const initialDefaults = useMemo(() => slugModeAndEngine(initialParsed.slug), [initialParsed.slug]);

  const [locale, setLocale] = useState<LocaleCode>(initialParsed.locale);
  const [slug, setSlug] = useState<RouteSlug>(initialParsed.slug);
  const [mode, setMode] = useState<StudioMode>(initialDefaults.mode);
  const [engineFilter, setEngineFilter] = useState<EngineFilter>(initialDefaults.engineFilter);
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);

  const [planTitle, setPlanTitle] = useState<string>("");
  const [planText, setPlanText] = useState<string>("");
  const [sqlText, setSqlText] = useState<string>("");
  const [showSqlBox, setShowSqlBox] = useState<boolean>(false);

  const [beforeName, setBeforeName] = useState<string>("Before");
  const [beforeText, setBeforeText] = useState<string>("");
  const [afterName, setAfterName] = useState<string>("After");
  const [afterText, setAfterText] = useState<string>("");

  const [deadlockText, setDeadlockText] = useState<string>("");

  const [wasmStatus, setWasmStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState<boolean>(false);
  const [parseErr, setParseErr] = useState<{ code?: string; message: string; hint?: string | null } | null>(null);
  const [active, setActive] = useState<ActiveResult | null>(null);

  const [redactShare, setRedactShare] = useState<boolean>(true);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([]);
  const [draggingZone, setDraggingZone] = useState<string | null>(null);

  const [themePref, setThemePref] = useState<ThemePref>("system");
  const [systemDark, setSystemDark] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [copiedCmdIdx, setCopiedCmdIdx] = useState<number | null>(null);

  const fileInputPlanRef = useRef<HTMLInputElement | null>(null);
  const fileInputBeforeRef = useRef<HTMLInputElement | null>(null);
  const fileInputAfterRef = useRef<HTMLInputElement | null>(null);
  const fileInputDeadlockRef = useRef<HTMLInputElement | null>(null);
  const langWrapRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const shareCopiedTimerRef = useRef<number | null>(null);

  const bundle = BUNDLES[locale];
  const ui = bundle.ui;
  const routeCopy = bundle.routes[slug];
  const baseRouteMeta = ROUTES.find((r) => r.slug === slug) ?? ROUTES[0];
  const activeLocaleSpec = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const captureGuides = useMemo(() => {
    if (mode === "deadlock") return DEADLOCK_GUIDES;
    if (engineFilter !== "auto") return [CAPTURE_GUIDES[engineFilter]];
    return baseRouteMeta.captureGuides;
  }, [baseRouteMeta.captureGuides, engineFilter, mode]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (typeof window !== "undefined") {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
    }
  }, []);

  const resolvedTheme: "dark" | "light" =
    themePref === "system" ? (systemDark ? "dark" : "light") : themePref;

  useEffect(() => {
    bindPlanViewerClipboard(async (text, label) => {
      const copied = await copyTextToClipboard(text);
      if (copied) {
        showToast(label ? `${ui.copied}: ${label.toLowerCase()}` : ui.copied);
        return true;
      }
      showToast("Clipboard permission denied");
      return false;
    });
    setHistoryItems(loadHistory());

    const storedTheme = window.localStorage.getItem("culprit-explain:theme");
    if (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system") {
      setThemePref(storedTheme);
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (ev: MediaQueryListEvent) => setSystemDark(ev.matches);
    mq.addEventListener("change", onChange);

    const onDocClick = (ev: MouseEvent) => {
      if (langWrapRef.current && !langWrapRef.current.contains(ev.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);

    return () => {
      mq.removeEventListener("change", onChange);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [showToast, ui.copied]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (themePref === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = themePref;
    }
  }, [themePref]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = activeLocaleSpec.htmlLang;
    }
  }, [activeLocaleSpec.htmlLang]);

  const cycleTheme = () => {
    const next: ThemePref =
      themePref === "system" ? (systemDark ? "light" : "dark") : themePref === "dark" ? "light" : "dark";
    setThemePref(next);
    try {
      window.localStorage.setItem("culprit-explain:theme", next);
    } catch {
      // Ignore
    }
    showToast(`Theme: ${next === "dark" ? "Dark" : "Light"}`);
  };

  useEffect(() => {
    let cancelled = false;

    const applyShareHash = async (hash: string) => {
      if (!hash.startsWith("#s=")) return;
      const wasm = await ensurePlansWasm();
      if (cancelled) return;
      const shared = await decodeShareHash(hash);
      if (!shared) {
        if (!cancelled) {
          setActive(null);
          setParseErr({ message: "Could not decode the shared link payload." });
        }
        return;
      }
      try {
        setParseErr(null);
        if (shared.m === "plan" && shared.p) {
          setMode("plan");
          setPlanText(shared.p);
          if (shared.q) {
            setSqlText(shared.q);
            setShowSqlBox(true);
          }
          const parsed = wasm.parsePlan(shared.p, shared.e);
          if (shared.q && !parsed.statement) parsed.statement = shared.q;
          setPlanTitle(shared.t || "Shared Execution Plan");
          setActive({ kind: "plan", plan: parsed, title: shared.t || "Shared Execution Plan" });
        } else if (shared.m === "compare" && shared.pa && shared.pb) {
          setMode("compare");
          setBeforeName(shared.na || "Before");
          setBeforeText(shared.pa);
          setAfterName(shared.nb || "After");
          setAfterText(shared.pb);
          if (shared.q) {
            setSqlText(shared.q);
          }
          const a = wasm.parsePlan(shared.pa, shared.e);
          const b = wasm.parsePlan(shared.pb, shared.e);
          if (shared.q) {
            if (!a.statement) a.statement = shared.q;
            if (!b.statement) b.statement = shared.q;
          }
          const diff = wasm.diffPlans(a, shared.na || "Before", b, shared.nb || "After");
          setActive({
            kind: "compare",
            a,
            b,
            diff,
            nameA: shared.na || "Before",
            nameB: shared.nb || "After",
          });
        } else if (shared.m === "deadlock" && shared.d) {
          setMode("deadlock");
          setDeadlockText(shared.d);
          if (isExtendedEventsXml(shared.d)) {
            const batch = wasm.parseExtendedEventsXml(shared.d);
            setActive({ kind: "events", batch, title: shared.t || "Shared Extended Events" });
          } else {
            const dls = wasm.parseDeadlock(shared.d);
            if (dls.length > 0) {
              setActive({ kind: "deadlock", deadlocks: dls, index: 0, title: shared.t || "Shared Deadlock" });
            } else {
              setActive(null);
              setParseErr({ message: "No deadlock cycle was found in the shared link." });
            }
          }
        } else if (shared.m === "events" && isValidSharedEventsBatch(shared.eb)) {
          setMode("deadlock");
          setActive({ kind: "events", batch: shared.eb, title: shared.t || "Shared Extended Events" });
        }
      } catch (err) {
        if (cancelled) return;
        const core = extractCoreError(err);
        setActive(null);
        setParseErr(
          core
            ? { code: core.code, message: core.message, hint: core.hint }
            : { message: err instanceof Error ? err.message : "Could not parse the shared link." },
        );
      }
    };

    (async () => {
      try {
        await ensurePlansWasm();
        if (cancelled) return;
        setWasmStatus("ready");
      } catch {
        if (!cancelled) setWasmStatus("error");
        return;
      }
      if (window.location.hash.startsWith("#s=")) {
        await applyShareHash(window.location.hash);
      }
    })();

    const onHashChange = () => {
      if (window.location.hash.startsWith("#s=")) {
        void applyShareHash(window.location.hash);
      }
    };

    const onPopState = () => {
      const parsed = parsePathnameLocaleAndSlug(window.location.pathname, basePath);
      const defs = slugModeAndEngine(parsed.slug);
      setLocale(parsed.locale);
      setSlug(parsed.slug);
      setMode(defs.mode);
      setEngineFilter(defs.engineFilter);
      document.title = BUNDLES[parsed.locale].routes[parsed.slug].title;
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelled = true;
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [basePath]);

  const navigate = useCallback(
    (nextLocale: LocaleCode, nextSlug: RouteSlug, overrideMode?: StudioMode) => {
      const defs = slugModeAndEngine(nextSlug);
      setLocale(nextLocale);
      setSlug(nextSlug);
      setMode(overrideMode ?? defs.mode);
      setEngineFilter(defs.engineFilter);
      setParseErr(null);
      setLangMenuOpen(false);
      if (typeof window !== "undefined") {
        const targetUrl = buildLocalizedPath(basePath, nextLocale, nextSlug);
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({}, "", `${targetUrl}${window.location.hash}`);
        }
        document.title = BUNDLES[nextLocale].routes[nextSlug].title;
      }
    },
    [basePath],
  );

  const runEventsXmlAnalysis = useCallback(async (rawInput: string, customTitle?: string) => {
    const trimmed = rawInput.trim();
    setBusy(true);
    setParseErr(null);
    try {
      const wasm = await ensurePlansWasm();
      setWasmStatus("ready");
      const batch = wasm.parseExtendedEventsXml(trimmed);
      const label = customTitle?.trim() || `Extended Events (${batch.records.length} events)`;
      setActive({ kind: "events", batch, title: label });
      setHistoryItems(
        saveHistoryEntry({
          fingerprint: quickFingerprint(`xexml:${trimmed}`),
          title: label,
          mode: "deadlock",
          engine: "mssql",
          summary: `Extended Events XML · ${batch.records.length} events · ${batch.deadlocks.length} deadlocks`,
          deadlockText: trimmed,
        }),
      );
    } catch (err) {
      const core = extractCoreError(err);
      setParseErr(
        core
          ? { code: core.code, message: core.message, hint: core.hint }
          : { message: err instanceof Error ? err.message : "Could not parse Extended Events XML." },
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const runXelAnalysis = useCallback(async (bytes: Uint8Array, fileName: string) => {
    setBusy(true);
    setParseErr(null);
    try {
      const wasm = await ensurePlansWasm();
      setWasmStatus("ready");
      const batch = wasm.parseXel(bytes);
      const label = fileName.trim() || "Extended Events (.xel)";
      setActive({ kind: "events", batch, title: label });
    } catch (err) {
      const core = extractCoreError(err);
      setParseErr(
        core
          ? { code: core.code, message: core.message, hint: core.hint }
          : { message: err instanceof Error ? err.message : "Could not parse binary .xel file." },
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const runPlanAnalysis = useCallback(
    async (rawInput: string, opts?: { title?: string; sql?: string; engineHint?: EngineFilter }) => {
      const trimmed = rawInput.trim();
      if (!trimmed) {
        setParseErr({ message: "Paste an execution plan or drop a .sqlplan / .xel / .json / .txt file first." });
        return;
      }
      const hint = opts?.engineHint ?? engineFilter;
      if ((hint === "auto" || hint === "mssql") && isExtendedEventsXml(trimmed)) {
        await runEventsXmlAnalysis(trimmed, opts?.title ?? planTitle);
        return;
      }
      setBusy(true);
      setParseErr(null);
      try {
        const wasm = await ensurePlansWasm();
        setWasmStatus("ready");
        const parsed = wasm.parsePlan(trimmed, hint === "auto" ? undefined : hint);
        const query = (opts?.sql ?? sqlText).trim();
        if (query && !parsed.statement) {
          parsed.statement = query;
        }
        const computedTitle =
          (opts?.title ?? planTitle).trim() ||
          `${ENGINE_META[parsed.engine].label} Plan (${countPlanNodes(parsed)} steps)`;
        setPlanTitle(computedTitle);
        setActive({ kind: "plan", plan: parsed, title: computedTitle });

        const dur = formatMs(parsed.facts.elapsed_ms);
        const summary = `${ENGINE_META[parsed.engine].label} · ${countPlanNodes(parsed)} steps${dur ? ` · ${dur}` : ""}`;
        setHistoryItems(
          saveHistoryEntry({
            fingerprint: quickFingerprint(`plan:${trimmed}:${query}`),
            title: computedTitle,
            mode: "plan",
            engine: parsed.engine,
            summary,
            planText: trimmed,
            sql: query || undefined,
          }),
        );
      } catch (err) {
        const core: CoreError | null = extractCoreError(err);
        setParseErr(
          core
            ? { code: core.code, message: core.message, hint: core.hint }
            : { message: err instanceof Error ? err.message : "Could not parse execution plan." },
        );
      } finally {
        setBusy(false);
      }
    },
    [engineFilter, planTitle, runEventsXmlAnalysis, sqlText],
  );

  const runCompareAnalysis = useCallback(
    async (
      rawA: string,
      rawB: string,
      opts?: { labelA?: string; labelB?: string; sql?: string; engineHint?: EngineFilter },
    ) => {
      const aTrim = rawA.trim();
      const bTrim = rawB.trim();
      if (!aTrim || !bTrim) {
        setParseErr({ message: "Provide both the Before plan and the After plan to compare." });
        return;
      }
      setBusy(true);
      setParseErr(null);
      try {
        const wasm = await ensurePlansWasm();
        setWasmStatus("ready");
        const hint = opts?.engineHint ?? engineFilter;
        const eng = hint === "auto" ? undefined : hint;
        const planA = wasm.parsePlan(aTrim, eng);
        const planB = wasm.parsePlan(bTrim, eng);
        const query = (opts?.sql ?? sqlText).trim();
        if (query) {
          if (!planA.statement) planA.statement = query;
          if (!planB.statement) planB.statement = query;
        }
        const nameA = (opts?.labelA ?? beforeName).trim() || "Before";
        const nameB = (opts?.labelB ?? afterName).trim() || "After";
        const diff = wasm.diffPlans(planA, nameA, planB, nameB);
        setActive({ kind: "compare", a: planA, b: planB, diff, nameA, nameB });

        setHistoryItems(
          saveHistoryEntry({
            fingerprint: quickFingerprint(`cmp:${aTrim}:${bTrim}`),
            title: `${nameA} vs ${nameB}`,
            mode: "compare",
            engine: planB.engine,
            summary: `${ENGINE_META[planB.engine].label} · ${diff.changes.length} structural changes`,
            beforeName: nameA,
            beforeText: aTrim,
            afterName: nameB,
            afterText: bTrim,
            sql: query || undefined,
          }),
        );
      } catch (err) {
        const core = extractCoreError(err);
        setParseErr(
          core
            ? { code: core.code, message: core.message, hint: core.hint }
            : { message: err instanceof Error ? err.message : "Could not compare plans." },
        );
      } finally {
        setBusy(false);
      }
    },
    [afterName, beforeName, engineFilter, sqlText],
  );

  const runDeadlockAnalysis = useCallback(
    async (rawInput: string, customTitle?: string) => {
      const trimmed = rawInput.trim();
      if (!trimmed) {
        setParseErr({ message: "Paste a deadlock XML graph, Extended Events XML, or drop a .xel / .xdl / .log file first." });
        return;
      }
      if (isExtendedEventsXml(trimmed)) {
        await runEventsXmlAnalysis(trimmed, customTitle);
        return;
      }
      setBusy(true);
      setParseErr(null);
      try {
        const wasm = await ensurePlansWasm();
        setWasmStatus("ready");
        const dls = wasm.parseDeadlock(trimmed);
        if (dls.length === 0) {
          setParseErr({ message: "No deadlock cycle was found in the provided input." });
          return;
        }
        const label = customTitle?.trim() || `Deadlock (${dls[0].processes.length} sessions)`;
        setActive({ kind: "deadlock", deadlocks: dls, index: 0, title: label });
        setHistoryItems(
          saveHistoryEntry({
            fingerprint: quickFingerprint(`dl:${trimmed}`),
            title: label,
            mode: "deadlock",
            summary: `Deadlock · ${dls[0].processes.length} sessions${dls.length > 1 ? ` (${dls.length} cycles)` : ""}`,
            deadlockText: trimmed,
          }),
        );
      } catch (err) {
        const core = extractCoreError(err);
        setParseErr(
          core
            ? { code: core.code, message: core.message, hint: core.hint }
            : { message: err instanceof Error ? err.message : "Could not parse deadlock input." },
        );
      } finally {
        setBusy(false);
      }
    },
    [runEventsXmlAnalysis],
  );

  const loadSample = useCallback(
    async (sample: SampleCase) => {
      setParseErr(null);
      if (sample.mode === "plan" && sample.planText) {
        setMode("plan");
        setPlanTitle(sample.title);
        setPlanText(sample.planText);
        setSqlText(sample.sql ?? "");
        setShowSqlBox(Boolean(sample.sql));
        await runPlanAnalysis(sample.planText, {
          title: sample.title,
          sql: sample.sql ?? "",
          engineHint: sample.engine ?? "auto",
        });
      } else if (sample.mode === "compare" && sample.beforeText && sample.afterText) {
        setMode("compare");
        setBeforeName(sample.beforeName ?? "Before");
        setBeforeText(sample.beforeText);
        setAfterName(sample.afterName ?? "After");
        setAfterText(sample.afterText);
        setSqlText(sample.sql ?? "");
        await runCompareAnalysis(sample.beforeText, sample.afterText, {
          labelA: sample.beforeName ?? "Before",
          labelB: sample.afterName ?? "After",
          sql: sample.sql ?? "",
          engineHint: sample.engine ?? "auto",
        });
      } else if (sample.mode === "deadlock" && sample.deadlockText) {
        setMode("deadlock");
        setDeadlockText(sample.deadlockText);
        await runDeadlockAnalysis(sample.deadlockText, sample.title);
      }
    },
    [runCompareAnalysis, runDeadlockAnalysis, runPlanAnalysis],
  );

  const restoreHistory = useCallback(
    async (item: HistoryEntry) => {
      setHistoryOpen(false);
      if (item.mode === "plan" && item.planText) {
        setMode("plan");
        setEngineFilter(item.engine ?? "auto");
        setPlanTitle(item.title);
        setPlanText(item.planText);
        setSqlText(item.sql ?? "");
        setShowSqlBox(Boolean(item.sql));
        await runPlanAnalysis(item.planText, {
          title: item.title,
          sql: item.sql ?? "",
          engineHint: item.engine ?? "auto",
        });
      } else if (item.mode === "compare" && item.beforeText && item.afterText) {
        setMode("compare");
        setBeforeName(item.beforeName ?? "Before");
        setBeforeText(item.beforeText);
        setAfterName(item.afterName ?? "After");
        setAfterText(item.afterText);
        setSqlText(item.sql ?? "");
        await runCompareAnalysis(item.beforeText, item.afterText, {
          labelA: item.beforeName ?? "Before",
          labelB: item.afterName ?? "After",
          sql: item.sql ?? "",
          engineHint: item.engine ?? "auto",
        });
      } else if (item.mode === "deadlock" && item.deadlockText) {
        setMode("deadlock");
        setDeadlockText(item.deadlockText);
        await runDeadlockAnalysis(item.deadlockText, item.title);
      }
    },
    [runCompareAnalysis, runDeadlockAnalysis, runPlanAnalysis],
  );

  const handleFileLoad = async (file: File, target: "plan" | "before" | "after" | "deadlock") => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (file.name.toLowerCase().endsWith(".xel") || hasXelMagic(bytes)) {
      await runXelAnalysis(bytes, file.name);
      return;
    }
    const text = decodeTextBytes(bytes);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    if (target === "plan") {
      setPlanText(text);
      setPlanTitle(baseName);
      await runPlanAnalysis(text, { title: baseName });
    } else if (target === "before") {
      setBeforeText(text);
      setBeforeName(baseName || "Before");
    } else if (target === "after") {
      setAfterText(text);
      setAfterName(baseName || "After");
    } else if (target === "deadlock") {
      setDeadlockText(text);
      await runDeadlockAnalysis(text, baseName);
    }
  };

  const makeDropHandlers = (zone: "plan" | "before" | "after" | "deadlock") => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setDraggingZone(zone);
    },
    onDragLeave: () => setDraggingZone((cur) => (cur === zone ? null : cur)),
    onDrop: async (e: DragEvent) => {
      e.preventDefault();
      setDraggingZone(null);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        await handleFileLoad(file, zone);
      }
    },
  });

  const handleShareLink = async () => {
    if (!active) return;
    try {
      const wasm = await ensurePlansWasm();
      let payload: SharePayloadV1;
      if (active.kind === "plan") {
        let rawPlan = active.plan.raw || planText.trim() || "";
        if (redactShare) {
          try {
            rawPlan = wasm.exportPlan(active.plan, active.title, "native", { redact: true, notes: [] }).contents;
          } catch {
            rawPlan = redactPayloadText(rawPlan);
          }
        }
        const query = active.plan.statement
          ? redactShare
            ? scrubSqlLiterals(active.plan.statement)
            : active.plan.statement
          : undefined;
        payload = { v: 1, m: "plan", t: active.title, e: active.plan.engine, p: rawPlan, q: query };
      } else if (active.kind === "compare") {
        let pa = active.a.raw || beforeText.trim() || "";
        let pb = active.b.raw || afterText.trim() || "";
        if (redactShare) {
          try {
            pa = wasm.exportPlan(active.a, active.nameA, "native", { redact: true, notes: [] }).contents;
          } catch {
            pa = redactPayloadText(pa);
          }
          try {
            pb = wasm.exportPlan(active.b, active.nameB, "native", { redact: true, notes: [] }).contents;
          } catch {
            pb = redactPayloadText(pb);
          }
        }
        const rawQuery = active.b.statement || active.a.statement || sqlText.trim() || undefined;
        const query = rawQuery ? (redactShare ? scrubSqlLiterals(rawQuery) : rawQuery) : undefined;
        const sharedEngine = active.a.engine === active.b.engine ? active.b.engine : undefined;
        payload = { v: 1, m: "compare", e: sharedEngine, q: query, na: active.nameA, pa, nb: active.nameB, pb };
      } else if (active.kind === "events") {
        payload = { v: 1, m: "events", t: active.title, eb: active.batch };
      } else {
        const dText = redactShare ? redactPayloadText(deadlockText) : deadlockText;
        payload = { v: 1, m: "deadlock", t: active.title, d: dText };
      }

      const encoded = await encodeShareHash(payload);
      if (!encoded.ok) {
        showToast("Plan is too large for a URL hash. Use Export HTML instead.");
        return;
      }
      const shareUrl = `${window.location.origin}${window.location.pathname}${encoded.hash}`;
      window.history.replaceState({}, "", `${window.location.pathname}${encoded.hash}`);
      const copied = await copyTextToClipboard(shareUrl);
      setShareCopied(true);
      if (shareCopiedTimerRef.current) window.clearTimeout(shareCopiedTimerRef.current);
      shareCopiedTimerRef.current = window.setTimeout(() => setShareCopied(false), 2200);
      showToast(
        copied
          ? redactShare
            ? "Copied redacted share link"
            : "Copied share link"
          : "Share link ready in address bar",
      );
    } catch {
      showToast("Could not create share link");
    }
  };

  const handleExportPlanFile = async (format: "html" | "markdown" | "native") => {
    if (!active || active.kind !== "plan") return;
    try {
      const wasm = await ensurePlansWasm();
      const exported = wasm.exportPlan(active.plan, active.title || "query-plan", format, {
        redact: redactShare,
        notes: [],
      });
      const mime =
        format === "html"
          ? "text/html;charset=utf-8"
          : format === "markdown"
            ? "text/markdown;charset=utf-8"
            : "application/octet-stream";
      const blob = new Blob([exported.contents], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exported.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${exported.name}`);
    } catch (err) {
      const core = extractCoreError(err);
      showToast(core ? core.message : "Export unavailable for this plan");
    }
  };

  const resetToFresh = () => {
    setActive(null);
    setParseErr(null);
    setPlanText("");
    setPlanTitle("");
    setSqlText("");
    setBeforeText("");
    setAfterText("");
    setDeadlockText("");
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const planTargetSlug: RouteSlug =
    engineFilter === "auto" ? "" : ENGINE_META[engineFilter].slug;

  return (
    <div className="ex-shell">
      <header className="ex-topbar">
        <div className="ex-topbar-inner">
          <div className="ex-brand-group">
            <a
              href={buildLocalizedPath(basePath, locale, "")}
              className="ex-brand"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  setActive(null);
                  navigate(locale, "");
                }
              }}
            >
              <img src={joinBase(basePath, "favicon.svg")} width={26} height={26} alt="" className="ex-logo" />
              <span className="ex-brand-text">
                Culprit <strong>Explain</strong>
              </span>
            </a>
            <span className={`ex-wasm-pill ${wasmStatus}`} title={ui.wasmTooltip}>
              <span className="ex-wasm-dot" />
              {wasmStatus === "ready"
                ? ui.localWasm
                : wasmStatus === "error"
                  ? ui.wasmOffline
                  : ui.loadingWasm}
            </span>
          </div>

          <nav className="ex-mode-tabs" aria-label="Analyzer mode">
            <a
              href={buildLocalizedPath(basePath, locale, planTargetSlug)}
              className={`ex-mode-tab ${mode === "plan" ? "active" : ""}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  setActive(null);
                  navigate(locale, planTargetSlug, "plan");
                }
              }}
            >
              <Zap size={14} />
              <span>{ui.tabPlan}</span>
            </a>
            <a
              href={buildLocalizedPath(basePath, locale, "compare")}
              className={`ex-mode-tab ${mode === "compare" ? "active" : ""}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  setActive(null);
                  navigate(locale, "compare", "compare");
                }
              }}
            >
              <GitCompare size={14} />
              <span>{ui.tabCompare}</span>
            </a>
            <a
              href={buildLocalizedPath(basePath, locale, "deadlock")}
              className={`ex-mode-tab ${mode === "deadlock" ? "active" : ""}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  setActive(null);
                  navigate(locale, "deadlock", "deadlock");
                }
              }}
            >
              <Lock size={14} />
              <span>{ui.tabDeadlock}</span>
            </a>
          </nav>

          <div className="ex-top-actions">
            <button
              type="button"
              className="ex-ghost-btn"
              onClick={() => setHistoryOpen(true)}
              aria-label={ui.localHistoryTitle}
            >
              <Clock size={14} />
              <span className="ex-hide-sm">{ui.history}</span>
              {historyItems.length > 0 && <span className="ex-count-badge">{historyItems.length}</span>}
            </button>

            <div className="ex-lang-wrap" ref={langWrapRef}>
              <button
                type="button"
                className="ex-ghost-btn ex-lang-btn"
                onClick={() => setLangMenuOpen((o) => !o)}
                aria-expanded={langMenuOpen}
                aria-label="Change language"
                title="Change language"
              >
                <Globe size={14} />
                <span className="ex-hide-sm">{activeLocaleSpec.nativeLabel}</span>
                <span className="ex-show-sm">{activeLocaleSpec.shortLabel}</span>
                <ChevronDown size={12} />
              </button>
              {langMenuOpen && (
                <div className="ex-lang-menu" role="menu">
                  {LOCALES.map((loc) => (
                    <a
                      key={loc.code}
                      href={buildLocalizedPath(basePath, loc.code, slug)}
                      className={`ex-lang-item ${loc.code === locale ? "active" : ""}`}
                      role="menuitem"
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          navigate(loc.code, slug, mode);
                        }
                      }}
                    >
                      <span>{loc.nativeLabel}</span>
                      {loc.code === locale && <Check size={13} />}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="ex-icon-btn"
              onClick={cycleTheme}
              title={`Switch theme (currently ${resolvedTheme})`}
              aria-label="Toggle color theme"
            >
              {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <a
              href="https://github.com/culpritsql"
              target="_blank"
              rel="noopener"
              className="ex-icon-btn ex-gh-org-btn"
              aria-label="Culprit SQL on GitHub"
              title="Culprit SQL on GitHub (@culpritsql)"
            >
              <GitHubIcon size={17} />
            </a>

            <a
              href="https://culpritsql.com"
              target="_blank"
              rel="noopener"
              className="ex-studio-cta ex-hide-md"
            >
              <span>{ui.sqlStudio}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </header>

      <main className="ex-main">
        {active ? (
          <section className="ex-workspace-active" aria-label="Analysis results">
            <div className="ex-active-bar">
              <div className="ex-active-left">
                <button type="button" className="ex-ghost-btn" onClick={() => setActive(null)}>
                  <ArrowLeft size={14} />
                  <span>{ui.editInput}</span>
                </button>
                <button type="button" className="ex-ghost-btn" onClick={resetToFresh}>
                  <Plus size={14} />
                  <span className="ex-hide-sm">{ui.newAnalysis}</span>
                </button>

                <span className="ex-v-sep" />

                {active.kind === "plan" && (
                  <div className="ex-active-identity">
                    <img
                      src={joinBase(basePath, ENGINE_META[active.plan.engine].icon)}
                      width={18}
                      height={18}
                      alt={ENGINE_META[active.plan.engine].label}
                    />
                    <input
                      type="text"
                      className="ex-inline-title"
                      value={active.title}
                      onChange={(e) => {
                        setPlanTitle(e.target.value);
                        setActive({ ...active, title: e.target.value });
                      }}
                      aria-label="Plan title"
                    />
                  </div>
                )}

                {active.kind === "compare" && (
                  <div className="ex-active-identity">
                    <img
                      src={joinBase(basePath, ENGINE_META[active.b.engine].icon)}
                      width={18}
                      height={18}
                      alt={ENGINE_META[active.b.engine].label}
                    />
                    <span className="ex-active-static-title">
                      {active.nameA} <span className="ex-muted">vs</span> {active.nameB}
                    </span>
                  </div>
                )}

                {active.kind === "deadlock" && (
                  <div className="ex-active-identity">
                    <Lock size={16} className="ex-amber-icon" />
                    <span className="ex-active-static-title">{active.title}</span>
                    {active.deadlocks.length > 1 && (
                      <div className="ex-dl-pager">
                        {active.deadlocks.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`ex-pill-sm ${idx === active.index ? "active" : ""}`}
                            onClick={() => setActive({ ...active, index: idx })}
                          >
                            #{idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {active.kind === "events" && (
                  <div className="ex-active-identity">
                    <img
                      src={joinBase(basePath, ENGINE_META.mssql.icon)}
                      width={18}
                      height={18}
                      alt={ENGINE_META.mssql.label}
                    />
                    <span className="ex-active-static-title">{active.title}</span>
                  </div>
                )}
              </div>

              <div className="ex-active-right">
                <label className="ex-redact-toggle">
                  <input
                    type="checkbox"
                    checked={redactShare}
                    onChange={(e) => setRedactShare(e.target.checked)}
                  />
                  <span>{ui.redactLiterals}</span>
                </label>

                <button
                  type="button"
                  className={`ex-primary-btn small ${shareCopied ? "copied" : ""}`}
                  onClick={handleShareLink}
                >
                  {shareCopied ? <Check size={13} /> : <Share2 size={13} />}
                  <span>{shareCopied ? `${ui.copied}!` : ui.shareLink}</span>
                </button>

                {active.kind === "plan" && (
                  <div className="ex-export-group" role="group" aria-label="Export plan">
                    <button
                      type="button"
                      className="ex-ghost-btn"
                      onClick={() => handleExportPlanFile("html")}
                    >
                      <Download size={13} />
                      <span>HTML</span>
                    </button>
                    <button
                      type="button"
                      className="ex-ghost-btn"
                      onClick={() => handleExportPlanFile("markdown")}
                    >
                      <FileText size={13} />
                      <span>MD</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="ex-viewer-frame">
              {active.kind === "plan" && (
                <PlanViewer plan={active.plan} title={active.title} theme={resolvedTheme} />
              )}
              {active.kind === "compare" && (
                <PlanDiffViewer
                  a={active.a}
                  b={active.b}
                  diff={active.diff}
                  nameA={active.nameA}
                  nameB={active.nameB}
                  theme={resolvedTheme}
                />
              )}
              {active.kind === "deadlock" && (
                <DeadlockViewer deadlock={active.deadlocks[active.index]} theme={resolvedTheme} />
              )}
              {active.kind === "events" && (
                <ExtendedEventsViewer batch={active.batch} title={active.title} theme={resolvedTheme} />
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="ex-hero">
              <div className="ex-glow" aria-hidden="true" />
              <div className="ex-container">
                <div className="ex-hero-head">
                  <div className="ex-trust-pill">
                    <ShieldCheck size={14} className="ex-trust-icon" />
                    <span>{ui.trustBanner}</span>
                  </div>
                  <h1>{routeCopy.h1}</h1>
                  <p className="ex-subtitle">{routeCopy.subtitle}</p>
                </div>

                {mode !== "deadlock" && (
                  <nav className="ex-engine-bar" aria-label="Database engine">
                    {ENGINE_PILLS.map((pill) => {
                      const isSelected = engineFilter === pill.id;
                      const href =
                        mode === "compare"
                          ? buildLocalizedPath(basePath, locale, "compare")
                          : buildLocalizedPath(basePath, locale, pill.slug);
                      return (
                        <a
                          key={pill.id}
                          href={href}
                          className={`ex-engine-pill ${isSelected ? "active" : ""}`}
                          onClick={(e) => {
                            if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                              e.preventDefault();
                              if (mode === "compare") {
                                setEngineFilter(pill.id);
                              } else {
                                navigate(locale, pill.slug, "plan");
                              }
                            }
                          }}
                        >
                          {pill.icon && (
                            <img src={joinBase(basePath, pill.icon)} width={15} height={15} alt="" />
                          )}
                          <span>{pill.labelKey === "auto" ? ui.autoDetect : pill.label}</span>
                        </a>
                      );
                    })}
                  </nav>
                )}

                {parseErr && (
                  <div className="ex-error-banner" role="alert">
                    <div className="ex-error-body">
                      <strong>{parseErr.code ? `Refused (${parseErr.code}): ` : "Error: "}</strong>
                      <span>{parseErr.message}</span>
                      {parseErr.hint && <p className="ex-error-hint">{parseErr.hint}</p>}
                    </div>
                    <button
                      type="button"
                      className="ex-icon-btn"
                      onClick={() => setParseErr(null)}
                      aria-label="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {mode === "plan" && (
                  <div
                    className={`ex-studio-card ${draggingZone === "plan" ? "dragging" : ""}`}
                    {...makeDropHandlers("plan")}
                  >
                    <div className="ex-card-head">
                      <div className="ex-card-head-left">
                        <FileCode2 size={15} className="ex-amber-icon" />
                        <input
                          type="text"
                          className="ex-title-input"
                          placeholder={ui.optionalTitlePlaceholder}
                          value={planTitle}
                          onChange={(e) => setPlanTitle(e.target.value)}
                          aria-label={ui.optionalTitlePlaceholder}
                        />
                      </div>
                      <div className="ex-card-actions">
                        <button
                          type="button"
                          className="ex-mini-btn"
                          onClick={() => setShowSqlBox((v) => !v)}
                        >
                          <Code2 size={13} />
                          <span>{showSqlBox ? ui.hideSql : ui.attachSql}</span>
                        </button>
                        <button
                          type="button"
                          className="ex-mini-btn"
                          onClick={async () => {
                            try {
                              const clip = await navigator.clipboard.readText();
                              if (clip) setPlanText(clip);
                            } catch {
                              showToast("Cmd/Ctrl+V");
                            }
                          }}
                        >
                          <ClipboardPaste size={13} />
                          <span>{ui.paste}</span>
                        </button>
                        <button
                          type="button"
                          className="ex-mini-btn"
                          onClick={() => fileInputPlanRef.current?.click()}
                        >
                          <FolderOpen size={13} />
                          <span>{ui.openFile}</span>
                        </button>
                        <input
                          ref={fileInputPlanRef}
                          type="file"
                          accept=".sqlplan,.xel,.xml,.json,.txt,.log"
                          hidden
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleFileLoad(f, "plan");
                            e.target.value = "";
                          }}
                        />
                      </div>
                    </div>

                    {showSqlBox && (
                      <div className="ex-sql-drawer">
                        <textarea
                          className="ex-code-area sql-short"
                          placeholder={ui.sqlPlaceholder}
                          value={sqlText}
                          onChange={(e) => setSqlText(e.target.value)}
                          spellCheck={false}
                        />
                      </div>
                    )}

                    <textarea
                      className="ex-code-area"
                      placeholder={baseRouteMeta.placeholder}
                      value={planText}
                      onChange={(e) => setPlanText(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          void runPlanAnalysis(planText);
                        }
                      }}
                      spellCheck={false}
                      aria-label="Execution plan input"
                    />

                    <div className="ex-card-foot">
                      <span className="ex-drop-hint">{ui.dropHintPlan}</span>
                      <button
                        type="button"
                        className="ex-primary-btn"
                        disabled={busy}
                        onClick={() => void runPlanAnalysis(planText)}
                      >
                        <Play size={14} fill="currentColor" />
                        <span>{busy ? ui.analyzing : ui.analyzePlan}</span>
                        <kbd className="ex-kbd">⌘↵</kbd>
                      </button>
                    </div>
                  </div>
                )}

                {mode === "compare" && (
                  <div className="ex-compare-studio">
                    <div className="ex-compare-grid">
                      <div
                        className={`ex-studio-card ${draggingZone === "before" ? "dragging" : ""}`}
                        {...makeDropHandlers("before")}
                      >
                        <div className="ex-card-head">
                          <div className="ex-card-head-left">
                            <span className="ex-side-pill a">A</span>
                            <input
                              type="text"
                              className="ex-title-input"
                              value={beforeName}
                              onChange={(e) => setBeforeName(e.target.value)}
                              aria-label="Before plan label"
                            />
                          </div>
                          <div className="ex-card-actions">
                            <button
                              type="button"
                              className="ex-mini-btn"
                              onClick={() => fileInputBeforeRef.current?.click()}
                            >
                              <FolderOpen size={13} />
                              <span>{ui.file}</span>
                            </button>
                            <input
                              ref={fileInputBeforeRef}
                              type="file"
                              accept=".sqlplan,.xml,.json,.txt"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) void handleFileLoad(f, "before");
                                e.target.value = "";
                              }}
                            />
                          </div>
                        </div>
                        <textarea
                          className="ex-code-area compare-area"
                          placeholder={ui.beforePlaceholder}
                          value={beforeText}
                          onChange={(e) => setBeforeText(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                              e.preventDefault();
                              void runCompareAnalysis(beforeText, afterText);
                            }
                          }}
                          spellCheck={false}
                        />
                      </div>

                      <div
                        className={`ex-studio-card ${draggingZone === "after" ? "dragging" : ""}`}
                        {...makeDropHandlers("after")}
                      >
                        <div className="ex-card-head">
                          <div className="ex-card-head-left">
                            <span className="ex-side-pill b">B</span>
                            <input
                              type="text"
                              className="ex-title-input"
                              value={afterName}
                              onChange={(e) => setAfterName(e.target.value)}
                              aria-label="After plan label"
                            />
                          </div>
                          <div className="ex-card-actions">
                            <button
                              type="button"
                              className="ex-mini-btn"
                              onClick={() => fileInputAfterRef.current?.click()}
                            >
                              <FolderOpen size={13} />
                              <span>{ui.file}</span>
                            </button>
                            <input
                              ref={fileInputAfterRef}
                              type="file"
                              accept=".sqlplan,.xml,.json,.txt"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) void handleFileLoad(f, "after");
                                e.target.value = "";
                              }}
                            />
                          </div>
                        </div>
                        <textarea
                          className="ex-code-area compare-area"
                          placeholder={ui.afterPlaceholder}
                          value={afterText}
                          onChange={(e) => setAfterText(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                              e.preventDefault();
                              void runCompareAnalysis(beforeText, afterText);
                            }
                          }}
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    <div className="ex-compare-bar">
                      <button
                        type="button"
                        className="ex-ghost-btn"
                        onClick={() => {
                          setBeforeName(afterName);
                          setAfterName(beforeName);
                          setBeforeText(afterText);
                          setAfterText(beforeText);
                        }}
                      >
                        <ArrowLeftRight size={14} />
                        <span>{ui.swapAB}</span>
                      </button>

                      <button
                        type="button"
                        className="ex-primary-btn"
                        disabled={busy}
                        onClick={() => void runCompareAnalysis(beforeText, afterText)}
                      >
                        <GitCompare size={14} />
                        <span>{busy ? ui.comparing : ui.comparePlans}</span>
                        <kbd className="ex-kbd">⌘↵</kbd>
                      </button>
                    </div>
                  </div>
                )}

                {mode === "deadlock" && (
                  <div
                    className={`ex-studio-card ${draggingZone === "deadlock" ? "dragging" : ""}`}
                    {...makeDropHandlers("deadlock")}
                  >
                    <div className="ex-card-head">
                      <div className="ex-card-head-left">
                        <Lock size={15} className="ex-amber-icon" />
                        <span className="ex-card-label">
                          SQL Server .xel &amp; XML · PostgreSQL Log · MySQL InnoDB Status
                        </span>
                      </div>
                      <div className="ex-card-actions">
                        <button
                          type="button"
                          className="ex-mini-btn"
                          onClick={async () => {
                            try {
                              const clip = await navigator.clipboard.readText();
                              if (clip) setDeadlockText(clip);
                            } catch {
                              showToast("Cmd/Ctrl+V");
                            }
                          }}
                        >
                          <ClipboardPaste size={13} />
                          <span>{ui.paste}</span>
                        </button>
                        <button
                          type="button"
                          className="ex-mini-btn"
                          onClick={() => fileInputDeadlockRef.current?.click()}
                        >
                          <FolderOpen size={13} />
                          <span>{ui.openFile}</span>
                        </button>
                        <input
                          ref={fileInputDeadlockRef}
                          type="file"
                          accept=".xel,.xdl,.xml,.log,.txt"
                          hidden
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleFileLoad(f, "deadlock");
                            e.target.value = "";
                          }}
                        />
                      </div>
                    </div>

                    <textarea
                      className="ex-code-area"
                      placeholder={baseRouteMeta.placeholder}
                      value={deadlockText}
                      onChange={(e) => setDeadlockText(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          void runDeadlockAnalysis(deadlockText);
                        }
                      }}
                      spellCheck={false}
                      aria-label="Deadlock dump input"
                    />

                    <div className="ex-card-foot">
                      <span className="ex-drop-hint">{ui.dropHintDeadlock}</span>
                      <button
                        type="button"
                        className="ex-primary-btn"
                        disabled={busy}
                        onClick={() => void runDeadlockAnalysis(deadlockText)}
                      >
                        <Play size={14} fill="currentColor" />
                        <span>{busy ? ui.analyzing : ui.visualizeDeadlock}</span>
                        <kbd className="ex-kbd">⌘↵</kbd>
                      </button>
                    </div>
                  </div>
                )}

                <div className="ex-samples-block" aria-labelledby="samples-heading">
                  <div className="ex-samples-header">
                    <span id="samples-heading" className="ex-kicker">
                      <Sparkles size={13} /> {ui.trySampleKicker}
                    </span>
                  </div>
                  <div className="ex-samples-grid">
                    {SAMPLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="ex-sample-card"
                        onClick={() => void loadSample(s)}
                      >
                        <span className="ex-sample-engine">
                          <img src={joinBase(basePath, s.icon)} width={15} height={15} alt="" />
                          <span>{s.badge}</span>
                        </span>
                        <div className="ex-sample-title">{s.title}</div>
                        <span className={`ex-sample-metric ${s.tone}`}>{s.metric}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="ex-info-section" aria-labelledby="capture-heading">
              <div className="ex-container">
                <div className="ex-section-head">
                  <h2 id="capture-heading">
                    {mode === "deadlock" ? ui.captureDeadlockHeading : ui.capturePlanHeading}
                  </h2>
                  <p>{ui.captureSub}</p>
                </div>

                <div className="ex-guides-grid">
                  {captureGuides.map((g, idx) => (
                    <article key={g.engineLabel} className="ex-guide-card">
                      <div className="ex-guide-head">
                        <div className="ex-guide-title">
                          <img src={joinBase(basePath, g.icon)} width={18} height={18} alt="" />
                          <h3>{g.engineLabel}</h3>
                        </div>
                        <button
                          type="button"
                          className="ex-mini-btn"
                          onClick={async () => {
                            if (await copyTextToClipboard(g.command)) {
                              setCopiedCmdIdx(idx);
                              window.setTimeout(() => setCopiedCmdIdx(null), 1800);
                            }
                          }}
                        >
                          {copiedCmdIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedCmdIdx === idx ? ui.copied : ui.copy}</span>
                        </button>
                      </div>
                      <pre className="ex-guide-pre">
                        <code>{g.command}</code>
                      </pre>
                      <p className="ex-guide-note">{g.note}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="ex-info-section ex-faq-section" aria-labelledby="faq-heading">
              <div className="ex-container ex-faq-layout">
                <div className="ex-faq-col">
                  <h2 id="faq-heading">{ui.faqHeading}</h2>
                  <div className="ex-faq-list">
                    {routeCopy.faqs.map((f) => (
                      <details key={f.q} className="ex-faq-item">
                        <summary>
                          <span>{f.q}</span>
                          <ChevronDown size={15} className="ex-faq-chevron" />
                        </summary>
                        <p>{f.a}</p>
                      </details>
                    ))}
                  </div>
                </div>

                <aside className="ex-upsell-card" aria-label="Culprit SQL Studio">
                  <div className="ex-upsell-badge">{ui.upsellBadge}</div>
                  <h3>{ui.upsellTitle}</h3>
                  <p>{ui.upsellBody}</p>
                  <div className="ex-upsell-actions">
                    <a href="https://culpritsql.com" target="_blank" rel="noopener" className="ex-primary-btn">
                      <span>{ui.upsellPrimaryCta}</span>
                      <ExternalLink size={14} />
                    </a>
                    <a
                      href="https://github.com/culpritsql/culprit-sql-studio"
                      target="_blank"
                      rel="noopener"
                      className="ex-ghost-btn"
                    >
                      <GitHubIcon size={14} />
                      <span>{ui.upsellSecondaryCta}</span>
                    </a>
                  </div>
                </aside>
              </div>
            </section>

            <section className="ex-info-section" aria-labelledby="eco-heading">
              <div className="ex-container">
                <div className="ex-section-head">
                  <h2 id="eco-heading">{ui.ecosystemHeading}</h2>
                  <p>{ui.ecosystemSub}</p>
                </div>

                <div className="ex-eco-grid">
                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <img src={joinBase(basePath, "favicon.svg")} width={20} height={20} alt="" className="ex-logo" />
                        <strong>Culprit SQL Studio</strong>
                      </span>
                    </div>
                    <p>{ui.ecoStudioDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://culpritsql.com" target="_blank" rel="noopener">
                        culpritsql.com ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-sql-studio" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>

                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <Server size={17} className="ex-amber-icon" />
                        <strong>Culprit Fleet</strong>
                      </span>
                      <span className="ex-eco-new-pill">NEW</span>
                    </div>
                    <p>{ui.ecoFleetDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://fleet.culpritsql.com" target="_blank" rel="noopener">
                        fleet.culpritsql.com ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-fleet" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>

                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <Code2 size={17} className="ex-amber-icon" />
                        <strong>Culprit SQL for VS Code</strong>
                      </span>
                      <span className="ex-eco-new-pill">NEW</span>
                    </div>
                    <p>{ui.ecoVscodeDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://marketplace.visualstudio.com/items?itemName=culpritsql.culprit-sql" target="_blank" rel="noopener">
                        VS Code ↗
                      </a>
                      <a href="https://open-vsx.org/extension/culpritsql/culprit-sql" target="_blank" rel="noopener">
                        Open VSX ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-vscode" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>

                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <Zap size={17} className="ex-amber-icon" />
                        <strong>@culpritsql/devtools</strong>
                      </span>
                      <span className="ex-eco-new-pill">NEW</span>
                    </div>
                    <p>{ui.ecoDevtoolsDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://www.npmjs.com/package/@culpritsql/devtools" target="_blank" rel="noopener">
                        npm ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-devtools" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>

                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <ShieldCheck size={17} className="ex-amber-icon" />
                        <strong>@culpritsql/ci</strong>
                      </span>
                      <span className="ex-eco-new-pill">NEW</span>
                    </div>
                    <p>{ui.ecoCiDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://www.npmjs.com/package/@culpritsql/ci" target="_blank" rel="noopener">
                        npm ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-ci" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>

                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <Package size={17} className="ex-amber-icon" />
                        <strong>@culpritsql/test</strong>
                      </span>
                      <span className="ex-eco-new-pill">NEW</span>
                    </div>
                    <p>{ui.ecoTestDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://www.npmjs.com/package/@culpritsql/test" target="_blank" rel="noopener">
                        npm ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-test" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>

                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <Package size={17} className="ex-amber-icon" />
                        <strong>@culpritsql/plans</strong>
                      </span>
                    </div>
                    <p>{ui.ecoPlansDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://www.npmjs.com/package/@culpritsql/plans" target="_blank" rel="noopener">
                        npm ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-plans" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>

                  <div className="ex-eco-card">
                    <div className="ex-eco-top">
                      <span className="ex-eco-title">
                        <Package size={17} className="ex-amber-icon" />
                        <strong>@culpritsql/plan-viewer</strong>
                      </span>
                    </div>
                    <p>{ui.ecoViewerDesc}</p>
                    <div className="ex-eco-links">
                      <a href="https://www.npmjs.com/package/@culpritsql/plan-viewer" target="_blank" rel="noopener">
                        npm ↗
                      </a>
                      <a href="https://github.com/culpritsql/culprit-plan-viewer" target="_blank" rel="noopener">
                        <GitHubIcon size={13} /> GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="ex-footer">
        <div className="ex-container ex-footer-stack">
          <div className="ex-footer-badges-row">
            <span className="ex-powered-label">Powered by</span>
            <div className="ex-shield-group">
              <ShieldBadge
                href="https://www.npmjs.com/package/@culpritsql/plans"
                icon="npm"
                label="@culpritsql/plans"
                value={`v${pkg.dependencies["@culpritsql/plans"].replace(/^[\^~]/, "")}`}
                color="#ffcf33"
              />
              <ShieldBadge
                href="https://www.npmjs.com/package/@culpritsql/plan-viewer"
                icon="npm"
                label="@culpritsql/plan-viewer"
                value={`v${pkg.dependencies["@culpritsql/plan-viewer"].replace(/^[\^~]/, "")}`}
                color="#61dafb"
              />
              <ShieldBadge
                href="https://culpritsql.com"
                label="Culprit SQL Studio"
                value="culpritsql.com"
                color="#4cbb84"
              />
              <ShieldBadge
                href="https://fleet.culpritsql.com"
                label="Culprit Fleet"
                value="fleet.culpritsql.com"
                color="#e5e2da"
              />
              <ShieldBadge
                href="https://github.com/culpritsql/culprit-explain"
                icon="github"
                label="Source"
                value="@culpritsql"
                color="#e5e2da"
              />
            </div>
          </div>

          <nav className="ex-footer-links" aria-label="Engine tools">
            {ROUTE_SLUGS.map((rSlug) => (
              <a
                key={rSlug || "home"}
                href={buildLocalizedPath(basePath, locale, rSlug)}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                    e.preventDefault();
                    setActive(null);
                    navigate(locale, rSlug);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              >
                {bundle.routes[rSlug].navLabel}
              </a>
            ))}
            <a href="https://fleet.culpritsql.com">Fleet</a>
            <a href="https://culpritsql.com/blog/">Blog</a>
          </nav>

          <nav className="ex-footer-locales" aria-label="Languages">
            {LOCALES.map((loc) => (
              <a
                key={loc.code}
                href={buildLocalizedPath(basePath, loc.code, slug)}
                lang={loc.htmlLang}
                className={loc.code === locale ? "active" : ""}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                    e.preventDefault();
                    navigate(loc.code, slug, mode);
                  }
                }}
              >
                {loc.nativeLabel}
              </a>
            ))}
          </nav>
        </div>
      </footer>

      {historyOpen && (
        <div className="ex-drawer-backdrop" onClick={() => setHistoryOpen(false)}>
          <aside
            className="ex-drawer"
            onClick={(e) => e.stopPropagation()}
            aria-label={ui.localHistoryTitle}
          >
            <div className="ex-drawer-head">
              <div>
                <h3>{ui.localHistoryTitle}</h3>
                <p>{ui.localHistorySub}</p>
              </div>
              <div className="ex-drawer-head-actions">
                {historyItems.length > 0 && (
                  <button
                    type="button"
                    className="ex-mini-btn"
                    onClick={() => setHistoryItems(clearHistory())}
                  >
                    <Trash2 size={13} />
                    <span>{ui.clear}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="ex-icon-btn"
                  onClick={() => setHistoryOpen(false)}
                  aria-label="Close history"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="ex-drawer-body">
              {historyItems.length === 0 ? (
                <div className="ex-drawer-empty">{ui.localHistoryEmpty}</div>
              ) : (
                historyItems.map((item) => (
                  <div key={item.id} className="ex-history-row">
                    <button
                      type="button"
                      className="ex-history-main"
                      onClick={() => void restoreHistory(item)}
                    >
                      <div className="ex-history-top">
                        <span className="ex-history-title">
                          {item.engine && (
                            <img
                              src={joinBase(basePath, ENGINE_META[item.engine].icon)}
                              width={14}
                              height={14}
                              alt=""
                            />
                          )}
                          <span>{item.title}</span>
                        </span>
                        <span className="ex-history-when">{relativeTime(item.savedAt)}</span>
                      </div>
                      <div className="ex-history-sub">{item.summary}</div>
                    </button>
                    <div className="ex-history-btns">
                      <button
                        type="button"
                        className={`ex-icon-btn small ${item.pinned ? "pinned" : ""}`}
                        onClick={() => setHistoryItems(togglePinHistory(item.id))}
                        title={item.pinned ? "Unpin" : "Pin"}
                      >
                        <Pin size={13} />
                      </button>
                      <button
                        type="button"
                        className="ex-icon-btn small"
                        onClick={() => setHistoryItems(deleteHistoryEntry(item.id))}
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className="ex-toast" role="status" aria-live="polite">
          <Check size={14} className="ex-toast-icon" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
