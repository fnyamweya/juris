import type { PolicyEvaluator } from '@juris/access-control';
import type { AuditEventStore } from '@juris/audit';
import type { TokenVerifier, VerifiedToken } from '@juris/auth';
import type { AuditEvent, AccessDecision } from '@juris/domain';
import type { Logger } from '@juris/observability';

export interface LogEntry {
  level: string;
  message: string;
  context?: Record<string, unknown>;
}

export function createMockLogger(): Logger & { getLogs: () => LogEntry[] } {
  const logs: LogEntry[] = [];

  const logger: Logger = {
    debug(message: string, context?: Record<string, unknown>) {
      logs.push({ level: 'debug', message, context });
    },
    info(message: string, context?: Record<string, unknown>) {
      logs.push({ level: 'info', message, context });
    },
    warn(message: string, context?: Record<string, unknown>) {
      logs.push({ level: 'warn', message, context });
    },
    error(message: string, context?: Record<string, unknown>) {
      logs.push({ level: 'error', message, context });
    },
  };

  return {
    ...logger,
    getLogs: () => [...logs],
  };
}

export function createMockTokenVerifier(result?: VerifiedToken): TokenVerifier {
  const resolved: VerifiedToken = result ?? {
    sub: 'user-123',
    email: 'test@example.com',
    iss: 'https://auth.example.com',
    aud: 'juris',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    claims: {},
  };

  return {
    async verify(_token: string): Promise<VerifiedToken> {
      return resolved;
    },
  };
}

export function createMockPolicyEvaluator(defaultDecision?: AccessDecision): PolicyEvaluator {
  const decision: AccessDecision = defaultDecision ?? {
    allowed: true,
    reason: 'Mock allowed',
    policyVersion: '1.0',
  };

  return {
    async evaluate(_request: unknown): Promise<AccessDecision> {
      return decision;
    },
  };
}

export function createMockAuditEventStore(): AuditEventStore & {
  events: AuditEvent[];
} {
  const events: AuditEvent[] = [];
  const latestByTenant = new Map<string, string>();

  return {
    events,

    async getLatestHash(tenantId: string): Promise<string> {
      return latestByTenant.get(tenantId) ?? 'GENESIS';
    },

    async persist(event: AuditEvent): Promise<void> {
      events.push(event);
      latestByTenant.set(String(event.tenantId), event.eventHash);
    },

    async getEvents(
      tenantId: string,
      query: { cursor?: string; limit: number },
    ): Promise<{ events: AuditEvent[]; cursor: string | null }> {
      const filtered = events.filter((e) => String(e.tenantId) === tenantId);
      const start = query.cursor ? filtered.findIndex((e) => String(e.id) === query.cursor) + 1 : 0;
      const slice = filtered.slice(start, start + query.limit);
      const lastInSlice = slice[slice.length - 1];
      const nextCursor =
        start + query.limit < filtered.length && lastInSlice !== undefined
          ? String(lastInSlice.id)
          : null;
      return { events: slice, cursor: nextCursor };
    },
  };
}
