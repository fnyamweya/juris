import type { Logger } from '@jusris/observability';

export interface VectorizeIndex {
  upsert(
    vectors: Array<{ id: string; values: number[]; metadata?: Record<string, string> }>,
  ): Promise<void>;
  query(
    vector: number[],
    options: { topK: number; returnMetadata?: boolean; filter?: Record<string, string> },
  ): Promise<Array<{ id: string; score: number; metadata?: Record<string, string> }>>;
  deleteByIds(ids: string[]): Promise<void>;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, string>;
}

export interface VectorQueryOptions {
  topK: number;
  filter?: Record<string, string>;
  returnMetadata?: boolean;
}

export interface VectorMatch {
  id: string;
  score: number;
  metadata?: Record<string, string>;
}

export interface VectorStoreClient {
  upsert(vectors: VectorRecord[]): Promise<void>;
  query(vector: number[], options: VectorQueryOptions): Promise<VectorMatch[]>;
  deleteByIds(ids: string[]): Promise<void>;
}

export function createVectorStoreClient(index: VectorizeIndex, logger: Logger): VectorStoreClient {
  return {
    async upsert(vectors: VectorRecord[]): Promise<void> {
      const start = performance.now();
      try {
        await index.upsert(vectors);
        logger.debug('Vectorize upsert completed', {
          count: vectors.length,
          durationMs: performance.now() - start,
        });
      } catch (err) {
        logger.error('Vectorize upsert failed', {
          count: vectors.length,
          durationMs: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },

    async query(vector: number[], options: VectorQueryOptions): Promise<VectorMatch[]> {
      const start = performance.now();
      try {
        const matches = await index.query(vector, {
          topK: options.topK,
          returnMetadata: options.returnMetadata,
          filter: options.filter,
        });
        logger.debug('Vectorize query completed', {
          topK: options.topK,
          resultCount: matches.length,
          durationMs: performance.now() - start,
        });
        return matches;
      } catch (err) {
        logger.error('Vectorize query failed', {
          topK: options.topK,
          durationMs: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },

    async deleteByIds(ids: string[]): Promise<void> {
      const start = performance.now();
      try {
        await index.deleteByIds(ids);
        logger.debug('Vectorize delete completed', {
          count: ids.length,
          durationMs: performance.now() - start,
        });
      } catch (err) {
        logger.error('Vectorize delete failed', {
          count: ids.length,
          durationMs: performance.now() - start,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  };
}
