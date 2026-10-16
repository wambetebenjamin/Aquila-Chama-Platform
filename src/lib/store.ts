/**
 * Storage layer.
 *
 * Production: Vercel KV (chama data, contributions, loans, meetings).
 * Local/dev/preview: an in-process Map, so the whole platform is clickable
 * without provisioning a database. The swap is transparent to callers.
 */

const globalStore = globalThis as unknown as {
  __aquilaStore?: Map<string, unknown>;
};

const memory: Map<string, unknown> =
  globalStore.__aquilaStore ?? new Map<string, unknown>();
globalStore.__aquilaStore = memory;

export function usingKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function client() {
  if (!usingKv()) return null;
  // Imported lazily so a missing KV config can never throw at module load.
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function storeGet<T>(key: string): Promise<T | null> {
  const kv = await client();
  if (kv) return ((await kv.get<T>(key)) ?? null) as T | null;
  return (memory.get(key) as T | undefined) ?? null;
}

export async function storeSet<T>(key: string, value: T): Promise<void> {
  const kv = await client();
  if (kv) {
    await kv.set(key, value);
    return;
  }
  memory.set(key, value);
}

export async function storeDel(key: string): Promise<void> {
  const kv = await client();
  if (kv) {
    await kv.del(key);
    return;
  }
  memory.delete(key);
}

/** Stable id generator (no crypto dependency, works on any runtime). */
let counter = 0;
export function makeId(prefix: string): string {
  counter += 1;
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1_000_000).toString(36);
  return `${prefix}_${stamp}${counter.toString(36)}${rand}`;
}
