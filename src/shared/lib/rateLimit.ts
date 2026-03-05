const store = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (val.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(
  key: string,
  opts: { windowMs?: number; max?: number } = {}
): { success: boolean; remaining: number } {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 20;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1 };
  }

  entry.count++;
  if (entry.count > max) {
    return { success: false, remaining: 0 };
  }
  return { success: true, remaining: max - entry.count };
}
