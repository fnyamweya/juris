import type { Logger } from '@juris/observability';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export function calculateBackoff(attempt: number, config: RetryConfig): number {
  const exponential = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const capped = Math.min(exponential, config.maxDelayMs);
  const jitter = capped * 0.1 * (Math.random() * 2 - 1);
  return Math.max(0, Math.floor(capped + jitter));
}

export function shouldRetry(attempt: number, config: RetryConfig): boolean {
  return attempt < config.maxRetries;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  logger: Logger,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (!shouldRetry(attempt, config)) {
        logger.error('Retries exhausted', {
          attempt: attempt + 1,
          maxRetries: config.maxRetries,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
      const delay = calculateBackoff(attempt, config);
      logger.warn('Retrying after failure', {
        attempt: attempt + 1,
        maxRetries: config.maxRetries,
        delayMs: delay,
        error: err instanceof Error ? err.message : String(err),
      });
      await sleep(delay);
    }
  }
  throw lastError;
}
