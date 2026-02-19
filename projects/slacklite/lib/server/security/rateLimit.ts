interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitOptions {
  key: string;
  max: number;
  windowMs: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function pruneExpiredTimestamps(
  timestamps: number[],
  windowMs: number,
  now: number,
): number[] {
  const threshold = now - windowMs;
  return timestamps.filter((timestamp) => timestamp > threshold);
}

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { key, max, windowMs, now = Date.now() } = options;
  const entry = rateLimitStore.get(key) ?? { timestamps: [] };
  const recentTimestamps = pruneExpiredTimestamps(entry.timestamps, windowMs, now);

  if (recentTimestamps.length >= max) {
    rateLimitStore.set(key, { timestamps: recentTimestamps });
    const oldestTimestamp = recentTimestamps[0];
    const retryAfterMs = Math.max(windowMs - (now - oldestTimestamp), 0);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil(retryAfterMs / 1000), 1),
    };
  }

  const nextTimestamps = [...recentTimestamps, now];
  rateLimitStore.set(key, { timestamps: nextTimestamps });

  return {
    allowed: true,
    remaining: Math.max(max - nextTimestamps.length, 0),
    retryAfterSeconds: 0,
  };
}

export function getClientIpAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    const normalizedIp = firstIp.trim();

    if (normalizedIp.length > 0) {
      return normalizedIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return "unknown";
}

export function __resetRateLimitStoreForTests(): void {
  rateLimitStore.clear();
}

