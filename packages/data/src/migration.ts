export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  first<T = unknown>(col?: string): Promise<T | null>;
  run(): Promise<D1ExecResult>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    duration: number;
    size: number;
    changes?: number;
    last_row_id?: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
  meta: {
    duration: number;
    size: number;
    changes?: number;
    last_row_id?: number;
  };
}

export interface Migration {
  version: string;
  name: string;
  up: string;
  down?: string;
}

export interface MigrationResult {
  version: string;
  name: string;
  status: 'applied' | 'skipped' | 'failed';
  error?: string;
}

export interface MigrationRunner {
  run(db: D1Database, migrations: Migration[]): Promise<MigrationResult[]>;
}

const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);
`;

export function createMigrationRunner(): MigrationRunner {
  return {
    async run(db: D1Database, migrations: Migration[]): Promise<MigrationResult[]> {
      await db.exec(MIGRATIONS_TABLE.trim());

      const results: MigrationResult[] = [];
      for (const m of migrations) {
        const existing = await db
          .prepare('SELECT 1 FROM _migrations WHERE version = ?')
          .bind(m.version)
          .first();
        if (existing) {
          results.push({ version: m.version, name: m.name, status: 'skipped' });
          continue;
        }
        try {
          await db.exec(m.up);
          await db
            .prepare('INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)')
            .bind(m.version, m.name, new Date().toISOString())
            .run();
          results.push({ version: m.version, name: m.name, status: 'applied' });
        } catch (err) {
          results.push({
            version: m.version,
            name: m.name,
            status: 'failed',
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
      return results;
    },
  };
}
