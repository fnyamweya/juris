import type { AuditChainSigner } from '@jusris/crypto';
import {
  createAuditEventId,
  type AuditEvent,
  type AuditAction,
  type PrincipalType,
} from '@jusris/domain';
import type { Logger } from '@jusris/observability';

const GENESIS_HASH = 'GENESIS';
const SIGNATURE_VERSION = '1';

export interface AuditEventStore {
  getLatestHash(tenantId: string): Promise<string>;
  persist(event: AuditEvent): Promise<void>;
  getEvents(
    tenantId: string,
    query: { cursor?: string; limit: number },
  ): Promise<{ events: AuditEvent[]; cursor: string | null }>;
}

export interface AuditTrailWriterDeps {
  signer: AuditChainSigner;
  store: AuditEventStore;
  logger: Logger;
}

export interface WriteAuditParams {
  tenantId: string;
  actorId: string;
  actorType: PrincipalType;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  matterId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditTrailWriter {
  constructor(private readonly deps: AuditTrailWriterDeps) { }

  async write(params: WriteAuditParams): Promise<AuditEvent> {
    const {
      tenantId,
      actorId,
      actorType,
      action,
      resourceType,
      resourceId,
      matterId,
      metadata = {},
    } = params;

    const previousHash = await this.deps.store.getLatestHash(tenantId).catch(() => GENESIS_HASH);

    const eventData = JSON.stringify({
      tenantId,
      actorId,
      actorType,
      action,
      resourceType,
      resourceId,
      matterId,
      metadata,
      timestamp: new Date().toISOString(),
    });

    const { eventHash, signature } = await this.deps.signer.sign(eventData, previousHash);

    const id = createAuditEventId(crypto.randomUUID());
    const timestamp = new Date();

    const event: AuditEvent = {
      id,
      tenantId: tenantId as AuditEvent['tenantId'],
      actorId: actorId as AuditEvent['actorId'],
      actorType: String(actorType),
      action,
      resourceType,
      resourceId,
      matterId: matterId as AuditEvent['matterId'],
      metadata: {
        ...metadata,
        signature,
      },
      previousHash,
      eventHash,
      signatureVersion: SIGNATURE_VERSION,
      timestamp,
    };

    await this.deps.store.persist(event);

    this.deps.logger.info('Audit event written', {
      eventId: id,
      tenantId,
      action,
      resourceType,
      resourceId,
    });

    return event;
  }
}
