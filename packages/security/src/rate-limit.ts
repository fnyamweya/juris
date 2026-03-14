export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

export const DEFAULT_RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000, keyPrefix: 'rl:api' },
  auth: { maxRequests: 10, windowMs: 60000, keyPrefix: 'rl:auth' },
  upload: { maxRequests: 20, windowMs: 60000, keyPrefix: 'rl:upload' },
  search: { maxRequests: 30, windowMs: 60000, keyPrefix: 'rl:search' },
} as const;
