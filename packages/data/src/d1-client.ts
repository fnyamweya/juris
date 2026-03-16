import type { Logger } from '@jusris/observability';

import { DataAccessError } from './errors.js';
import type { D1Database, D1ExecResult, D1PreparedStatement, D1Result } from './migration.js';

export interface D1Client {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: unknown[]): Promise<T | null>;
  execute(sql: string, params?: unknown[]): Promise<D1ExecResult>;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  prepare(sql: string): D1PreparedStatement;
}

export function createD1Client(db: D1Database, logger: Logger): D1Client {
  async function withTiming<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.debug('D1 query completed', { operation, durationMs: duration });
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      logger.error('D1 query failed', {
        operation,
        durationMs: duration,
        error: err instanceof Error ? err.message : String(err),
      });
      throw new DataAccessError(
        err instanceof Error ? err.message : 'D1 query failed',
        'QUERY_FAILED',
        err,
      );
    }
  }

  return {
    async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
      return withTiming('query', async () => {
        let stmt = db.prepare(sql);
        if (params?.length) {
          stmt = stmt.bind(...params);
        }
        const result = await stmt.all<T>();
        if (!result.success && result.error) {
          throw new Error(result.error);
        }
        return result.results ?? [];
      });
    },

    async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
      return withTiming('queryOne', async () => {
        let stmt = db.prepare(sql);
        if (params?.length) {
          stmt = stmt.bind(...params);
        }
        return stmt.first<T>();
      });
    },

    async execute(sql: string, params?: unknown[]): Promise<D1ExecResult> {
      return withTiming('execute', async () => {
        let stmt = db.prepare(sql);
        if (params?.length) {
          stmt = stmt.bind(...params);
        }
        return stmt.run();
      });
    },

    async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
      return withTiming('batch', async () => {
        const results = await db.batch(statements);
        for (const r of results) {
          if (!r.success && r.error) {
            throw new Error(r.error);
          }
        }
        return results;
      });
    },

    prepare(sql: string): D1PreparedStatement {
      return db.prepare(sql);
    },
  };
}
