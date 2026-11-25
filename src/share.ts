import type { Engine, ExtendedEventsBatch } from "@culpritsql/plan-viewer";
import type { StudioMode } from "./routes";

export interface SharePayloadV1 {
  v: 1;
  m: StudioMode | "events";
  t?: string;
  e?: Engine;
  q?: string;
  p?: string;
  na?: string;
  pa?: string;
  nb?: string;
  pb?: string;
  d?: string;
  eb?: ExtendedEventsBatch;
}

export function isValidSharedEventsBatch(value: unknown): value is ExtendedEventsBatch {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ExtendedEventsBatch>;
  return (
    (candidate.format === "xel" || candidate.format === "xml") &&
    Array.isArray(candidate.records) &&
    Array.isArray(candidate.deadlocks) &&
    Array.isArray(candidate.locations) &&
    Array.isArray(candidate.issues) &&
    typeof candidate.records_examined === "number"
  );
}

const MAX_HASH_CHARS = 28_000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compressBytes(input: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === "undefined") {
    return input;
  }
  const stream = new Blob([new Uint8Array(input)]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function decompressBytes(input: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    return input;
  }
  const stream = new Blob([new Uint8Array(input)]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

/** Scrub SQL string, hex, and numeric literals while preserving parameter markers ($1, @p1) and 0/1 flags. */
export function scrubSqlLiterals(text: string): string {
  return text
    .replace(/N?'(?:''|[^'])*'/g, "'?'")
    .replace(/\b0x[0-9a-fA-F]+\b/g, "0x?")
    .replace(/(?<![$@])\b\d+(?:\.\d+)?\b/g, (num) => (num === "0" || num === "1" ? num : "?"));
}

function unescapeXml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x9;/gi, "\t")
    .replace(/&#xA;/gi, "\n")
    .replace(/&#xD;/gi, "\r")
    .replace(/&amp;/g, "&");
}

function escapeXmlText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXmlAttr(value: string): string {
  return escapeXmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\t/g, "&#x9;")
    .replace(/\n/g, "&#xA;")
    .replace(/\r/g, "&#xD;");
}

const JSON_PREDICATE_KEYS = new Set([
  "Query Text",
  "query",
  "Filter",
  "Index Cond",
  "Recheck Cond",
  "Hash Cond",
  "Merge Cond",
  "Join Filter",
  "One-Time Filter",
  "Conflict Filter",
  "TID Cond",
  "Storage Filter",
  "Storage Index Filter",
  "attached_condition",
  "pushed_index_condition",
]);

function redactJsonValue(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    if (key && JSON_PREDICATE_KEYS.has(key)) {
      return scrubSqlLiterals(value);
    }
    if (value.includes("'")) {
      return value.replace(/N?'(?:''|[^'])*'/g, "'?'");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactJsonValue(item));
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactJsonValue(v, k);
    }
    return out;
  }
  return value;
}

const TEXT_MEASURE_KEYS = new Set([
  "buffers",
  "planning",
  "planning time",
  "execution time",
  "workers planned",
  "workers launched",
  "sort method",
  "heap blocks",
  "batches",
  "memory usage",
  "i/o timings",
  "jit",
  "functions",
  "options",
  "timing",
  "rows removed by filter",
  "rows removed by index recheck",
  "rows removed by join filter",
  "heap fetches",
  "peak memory usage",
  "disk usage",
  "cache hits",
  "cache misses",
  "cache evictions",
  "hits",
  "misses",
  "evictions",
]);

function redactExplainTextLine(line: string): string {
  const markers = ["(cost=", "(actual ", "(never executed)", "(rows="];
  let firstIdx = -1;
  for (const m of markers) {
    const idx = line.indexOf(m);
    if (idx >= 0 && (firstIdx < 0 || idx < firstIdx)) {
      firstIdx = idx;
    }
  }
  if (firstIdx >= 0) {
    return `${scrubSqlLiterals(line.slice(0, firstIdx))}${line.slice(firstIdx)}`;
  }
  const trimmed = line.trimStart();
  const colonIdx = trimmed.indexOf(": ");
  if (colonIdx > 0) {
    const key = trimmed.slice(0, colonIdx);
    if (/^[A-Za-z0-9 /\-]+$/.test(key)) {
      if (TEXT_MEASURE_KEYS.has(key.trim().toLowerCase())) {
        return line;
      }
      const indent = line.slice(0, line.length - trimmed.length);
      return `${indent}${key}: ${scrubSqlLiterals(trimmed.slice(colonIdx + 2))}`;
    }
  }
  return line.replace(/N?'(?:''|[^'])*'/g, "'?'");
}

function redactPostgresDeadlockLog(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const procStmt = line.match(/^([\s\S]*?\bProcess\s+\d+:\s+)(?!waits\s+for\b)([\s\S]*)$/);
      if (procStmt) {
        return `${procStmt[1]}${scrubSqlLiterals(procStmt[2])}`;
      }
      const stmtLine = line.match(/^([\s\S]*?\bSTATEMENT:\s*)([\s\S]*)$/);
      if (stmtLine) {
        return `${stmtLine[1]}${scrubSqlLiterals(stmtLine[2])}`;
      }
      return line;
    })
    .join("\n");
}

function redactInnodbDeadlockStatus(text: string): string {
  let inStatement = false;
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("*** ") || trimmed.startsWith("RECORD LOCKS ") || trimmed.startsWith("TABLE LOCK ")) {
        inStatement = false;
        return line;
      }
      if (trimmed.startsWith("MySQL thread id ") || trimmed.startsWith("MariaDB thread id ")) {
        inStatement = true;
        return line;
      }
      if (inStatement) {
        if (!trimmed) {
          inStatement = false;
          return line;
        }
        const indent = line.slice(0, line.length - line.trimStart().length);
        return `${indent}${scrubSqlLiterals(line.trimStart())}`;
      }
      return line.replace(/N?'(?:''|[^'])*'/g, "'?'");
    })
    .join("\n");
}

/**
 * Format-aware literal redaction for JSON plans, XML Showplan / deadlock dumps, server deadlock logs,
 * and plain-text EXPLAIN trees so redacted share links remain valid parseable inputs.
 */
export function redactPayloadText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(redactJsonValue(parsed));
    } catch {
      return scrubSqlLiterals(text);
    }
  }

  if (trimmed.startsWith("<") || /<deadlock[\s>]/i.test(trimmed)) {
    return text
      .replace(
        /\b(ParameterCompiledValue|ParameterRuntimeValue|ConstValue|LowBoundary|HighBoundary)="([^"]*)"/g,
        '$1="?"',
      )
      .replace(
        /\b(StatementText|ScalarString|ParameterizedText|Expression)="([^"]*)"/g,
        (_m, attr: string, val: string) => `${attr}="${escapeXmlAttr(scrubSqlLiterals(unescapeXml(val)))}"`,
      )
      .replace(
        /<(inputbuf|frame\b[^>]*)>([\s\S]*?)<\/(inputbuf|frame)>/gi,
        (_m, openTag: string, body: string, closeTag: string) =>
          `<${openTag}>${escapeXmlText(scrubSqlLiterals(unescapeXml(body)))}</${closeTag}>`,
      );
  }

  if (trimmed.includes("LATEST DETECTED DEADLOCK") || trimmed.includes("*** (1) TRANSACTION")) {
    return redactInnodbDeadlockStatus(text);
  }

  if (trimmed.includes("deadlock detected")) {
    return redactPostgresDeadlockLog(text);
  }

  return text.split("\n").map(redactExplainTextLine).join("\n");
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to synchronous execCommand copy when transient activation expired after async work.
    }
  }
  if (typeof document !== "undefined" && document.body) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      ta.style.left = "-9999px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const copied = document.execCommand("copy");
      ta.remove();
      return copied;
    } catch {
      return false;
    }
  }
  return false;
}

export async function encodeShareHash(
  payload: SharePayloadV1,
): Promise<{ ok: true; hash: string } | { ok: false; reason: "too_large" }> {
  const json = JSON.stringify(payload);
  const rawBytes = new TextEncoder().encode(json);
  const compressed = await compressBytes(rawBytes);
  const prefix = typeof CompressionStream === "undefined" ? "u1." : "z1.";
  const encoded = `${prefix}${toBase64Url(compressed)}`;
  if (encoded.length > MAX_HASH_CHARS) {
    return { ok: false, reason: "too_large" };
  }
  return { ok: true, hash: `#s=${encoded}` };
}

export async function decodeShareHash(hashOrUrl: string): Promise<SharePayloadV1 | null> {
  let fragment = hashOrUrl;
  const hashIdx = hashOrUrl.indexOf("#");
  if (hashIdx >= 0) {
    fragment = hashOrUrl.slice(hashIdx + 1);
  }
  const params = new URLSearchParams(fragment);
  const token = params.get("s");
  if (!token) return null;
  try {
    let bytes: Uint8Array;
    if (token.startsWith("z1.")) {
      bytes = await decompressBytes(fromBase64Url(token.slice(3)));
    } else if (token.startsWith("u1.")) {
      bytes = fromBase64Url(token.slice(3));
    } else {
      return null;
    }
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SharePayloadV1;
    if (parsed?.v !== 1 || !parsed.m) return null;
    return parsed;
  } catch {
    return null;
  }
}
