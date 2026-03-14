import type { AuditEvent } from '@jusris/domain';

export interface AuditLogWriter {
  write(event: AuditEvent): Promise<void>;
}
