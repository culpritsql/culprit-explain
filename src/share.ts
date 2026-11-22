import type { Engine } from "@culpritsql/plan-viewer";
import type { StudioMode } from "./routes";

export interface SharePayloadV1 {
  v: 1;
  m: StudioMode;
  t?: string;
  e?: Engine;
  q?: string;
  p?: string;
  na?: string;
  pa?: string;
  nb?: string;
  pb?: string;
  d?: string;
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
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  await writer.write(new Uint8Array(input));
  await writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buf);
}

async function decompressBytes(input: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    return input;
  }
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  await writer.write(new Uint8Array(input));
  await writer.close();
  const buf = await new Response(ds.readable).arrayBuffer();
  return new Uint8Array(buf);
}

/** Scrub SQL string and numeric literals for non-XML text payloads when sharing redacted links. */
export function scrubSqlLiterals(text: string): string {
  return text
    .replace(/'(?:''|[^'])*'/g, "'?'")
    .replace(/\b\d+(?:\.\d+)?\b/g, (num) => (num === "0" || num === "1" ? num : "?"));
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

export async function decodeShareHash(hash: string): Promise<SharePayloadV1 | null> {
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(trimmed);
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
