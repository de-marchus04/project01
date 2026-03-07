// ---------------------------------------------------------------------------
// In-memory fallback (development / tests where Upstash is not configured)
// ---------------------------------------------------------------------------
const _store = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of _store) {
    if (val.resetAt < now) _store.delete(key);
  }
}, 5 * 60 * 1000);

function _rateLimitInMemory(
  key: string,
  windowMs: number,
  max: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = _store.get(key);
  if (!entry || entry.resetAt < now) {
    _store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1 };
  }
  entry.count++;
  if (entry.count > max) return { success: false, remaining: 0 };
  return { success: true, remaining: max - entry.count };
}

// ---------------------------------------------------------------------------
// Upstash Redis backend (production)
// Uses INCR + PEXPIRE NX via the REST API — no extra package needed.
// ---------------------------------------------------------------------------
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function _rateLimitRedis(
  key: string,
  windowMs: number,
  max: number,
): Promise<{ success: boolean; remaining: number }> {
  try {
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, windowMs, 'NX'],
      ]),
    });
    const data = await res.json();
    const count: number = data[0]?.result ?? 1;
    const success = count <= max;
    return { success, remaining: Math.max(0, max - count) };
  } catch {
    // If Redis is unreachable, fail open (don't block legitimate users)
    console.error('rateLimit: Redis unavailable, skipping limit check');
    return { success: true, remaining: max };
  }
}

// ---------------------------------------------------------------------------
// Public API  (always async so callers use `await rateLimit(...)`)
// ---------------------------------------------------------------------------
export async function rateLimit(
  key: string,
  opts: { windowMs?: number; max?: number } = {},
): Promise<{ success: boolean; remaining: number }> {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 20;

  if (REDIS_URL && REDIS_TOKEN) {
    return _rateLimitRedis(key, windowMs, max);
  }

  return _rateLimitInMemory(key, windowMs, max);
}
