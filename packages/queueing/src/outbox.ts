export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  run(): Promise<D1ExecResult>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
}

export interface D1ExecResult {
  count: number;
  meta: { changes?: number; last_row_id?: number };
}

export interface Queue {
  send(
    messages:
      | { body: unknown }
      | { body: unknown; contentType?: string }[]
  ): Promise<void>;
}

export interface OutboxMessage {
  id: string;
  tenantId: string;
  eventType: string;
  payload: string;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  createdAt: string;
  publishedAt?: string;
  retries: number;
}

export interface OutboxWriter {
  write(db: D1Database, messages: OutboxMessage[]): Promise<void>;
}

export interface OutboxPublisher {
  publishPending(
    db: D1Database,
    queue: Queue,
    batchSize: number
  ): Promise<number>;
}
