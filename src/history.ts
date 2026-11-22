import type { Engine } from "@culpritsql/plan-viewer";
import type { StudioMode } from "./routes";

export interface HistoryEntry {
  id: string;
  fingerprint: string;
  title: string;
  mode: StudioMode;
  engine?: Engine;
  summary: string;
  savedAt: string;
  pinned?: boolean;
  sql?: string;
  planText?: string;
  beforeName?: string;
  beforeText?: string;
  afterName?: string;
  afterText?: string;
  deadlockText?: string;
}

const STORAGE_KEY = "culprit-explain:history:v1";
const MAX_ENTRIES = 25;
const MAX_ENTRY_CHARS = 380_000;

export function quickFingerprint(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, "0")}${(h1 >>> 0).toString(16).padStart(8, "0")}`;
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function persistHistory(entries: HistoryEntry[]): HistoryEntry[] {
  if (typeof window === "undefined") return entries;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded on large plans; keep pinned + newest half
    const trimmed = [...entries.filter((e) => e.pinned), ...entries.filter((e) => !e.pinned).slice(0, 8)];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return trimmed;
    } catch {
      // Ignore storage failures in private browsing
    }
  }
  return entries;
}

export function saveHistoryEntry(
  candidate: Omit<HistoryEntry, "id" | "savedAt">,
): HistoryEntry[] {
  const payloadLen =
    (candidate.planText?.length ?? 0) +
    (candidate.beforeText?.length ?? 0) +
    (candidate.afterText?.length ?? 0) +
    (candidate.deadlockText?.length ?? 0);
  const current = loadHistory();
  if (payloadLen > MAX_ENTRY_CHARS) {
    return current;
  }
  const existing = current.find((e) => e.fingerprint === candidate.fingerprint);
  const entry: HistoryEntry = {
    ...candidate,
    id: existing?.id ?? `${Date.now().toString(36)}-${candidate.fingerprint.slice(0, 6)}`,
    pinned: existing?.pinned ?? candidate.pinned ?? false,
    savedAt: new Date().toISOString(),
  };
  const rest = current.filter((e) => e.fingerprint !== candidate.fingerprint);
  const pinned = [entry, ...rest].filter((e) => e.pinned);
  const unpinned = [entry, ...rest].filter((e) => !e.pinned);
  const next = [...pinned, ...unpinned].slice(0, MAX_ENTRIES);
  return persistHistory(next);
}

export function togglePinHistory(id: string): HistoryEntry[] {
  const next = loadHistory().map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e));
  return persistHistory(next);
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  return persistHistory(next);
}

export function clearHistory(): HistoryEntry[] {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return [];
}
