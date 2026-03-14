import type { Logger } from '@jusris/observability';

export interface IdempotencyStore {
  exists(key: string): Promise<boolean>;
  set(key: string, ttlSeconds: number): Promise<void>;
  remove(key: string): Promise<void>;
}

export type IdempotencyResult<T> =
  | { result: T; wasIdempotent: false }
  | { result: undefined; wasIdempotent: true };

export async function withIdempotency<T>(params: {
  key: string;
  store: IdempotencyStore;
  ttlSeconds: number;
  operation: () => Promise<T>;
  logger: Logger;
}): Promise<IdempotencyResult<T>> {
  const { key, store, ttlSeconds, operation, logger } = params;

  const exists = await store.exists(key);
  if (exists) {
    logger.info('Idempotent key already exists, skipping operation', { key });
    return { result: undefined, wasIdempotent: true };
  }

  try {
    const result = await operation();
    await store.set(key, ttlSeconds);
    return { result, wasIdempotent: false };
  } catch (err) {
    await store.remove(key);
    throw err;
  }
}
