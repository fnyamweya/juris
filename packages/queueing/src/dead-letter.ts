export interface DeadLetterRecord {
  id: string;
  originalQueue: string;
  eventType: string;
  payload: string;
  error: string;
  failedAt: string;
  retryCount: number;
  tenantId?: string;
}

export interface DeadLetterWriter {
  write(record: DeadLetterRecord): Promise<void>;
}
