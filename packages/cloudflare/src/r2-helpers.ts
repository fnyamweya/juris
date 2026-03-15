import type { Logger } from '@jusris/observability';

export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: R2PutOptions,
  ): Promise<R2ObjectMetadata>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

export interface R2PutOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
}

export interface R2ObjectMetadata {
  key: string;
  size: number;
  etag: string;
  contentType?: string;
  uploaded: string;
}

export interface R2ObjectBody {
  body: ReadableStream;
  size: number;
  etag?: string;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}

export interface R2ListOptions {
  prefix?: string;
  cursor?: string;
  limit?: number;
}

export interface R2Objects {
  objects: R2ObjectMetadata[];
  truncated: boolean;
  cursor?: string;
}

export interface R2StorageClient {
  put(
    key: string,
    body: ReadableStream | ArrayBuffer | string,
    options?: R2PutOptions,
  ): Promise<R2ObjectMetadata>;
  get(key: string): Promise<{ body: ReadableStream; metadata: R2ObjectMetadata } | null>;
  delete(key: string): Promise<void>;
  list(
    prefix: string,
    options?: { cursor?: string; limit?: number },
  ): Promise<{ objects: R2ObjectMetadata[]; cursor?: string }>;
}

export function createR2StorageClient(bucket: R2Bucket, logger: Logger): R2StorageClient {
  return {
    async put(
      key: string,
      body: ReadableStream | ArrayBuffer | string,
      options?: R2PutOptions,
    ): Promise<R2ObjectMetadata> {
      const start = performance.now();
      try {
        const metadata = await bucket.put(key, body, options);
        logger.debug('R2 put completed', {
          key,
          durationMs: performance.now() - start,
        });
        return metadata;
      } catch (err) {
        logger.error('R2 put failed', {
          key,
          durationMs: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },

    async get(key: string): Promise<{ body: ReadableStream; metadata: R2ObjectMetadata } | null> {
      const start = performance.now();
      try {
        const obj = await bucket.get(key);
        if (!obj) {
          logger.debug('R2 get miss', {
            key,
            durationMs: performance.now() - start,
          });
          return null;
        }
        const metadata: R2ObjectMetadata = {
          key,
          size: obj.size,
          etag: obj.etag ?? '',
          contentType: obj.httpMetadata?.contentType,
          uploaded: '',
        };
        logger.debug('R2 get completed', {
          key,
          durationMs: performance.now() - start,
        });
        return { body: obj.body, metadata };
      } catch (err) {
        logger.error('R2 get failed', {
          key,
          durationMs: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },

    async delete(key: string): Promise<void> {
      const start = performance.now();
      try {
        await bucket.delete(key);
        logger.debug('R2 delete completed', {
          key,
          durationMs: performance.now() - start,
        });
      } catch (err) {
        logger.error('R2 delete failed', {
          key,
          durationMs: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },

    async list(
      prefix: string,
      options?: { cursor?: string; limit?: number },
    ): Promise<{ objects: R2ObjectMetadata[]; cursor?: string }> {
      const start = performance.now();
      try {
        const result = await bucket.list({
          prefix,
          cursor: options?.cursor,
          limit: options?.limit,
        });
        logger.debug('R2 list completed', {
          prefix,
          count: result.objects.length,
          durationMs: performance.now() - start,
        });
        return {
          objects: result.objects,
          cursor: result.truncated ? result.cursor : undefined,
        };
      } catch (err) {
        logger.error('R2 list failed', {
          prefix,
          durationMs: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  };
}
