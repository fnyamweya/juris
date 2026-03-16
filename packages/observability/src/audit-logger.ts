import type { AuditEvent } from '@juris/domain';

export interface AuditLogWriter {
  write(event: AuditEvent): Promise<void>;
}
