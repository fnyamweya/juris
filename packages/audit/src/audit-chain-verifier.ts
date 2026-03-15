import type { AuditEvent } from '@jusris/domain';
import { verifyAuditChainEntry } from '@jusris/crypto';

export interface BrokenLink {
  eventId: string;
  expected: string;
  actual: string;
  reason: string;
}

export interface ChainVerificationResult {
  valid: boolean;
  eventsVerified: number;
  brokenLinks: BrokenLink[];
  verifiedAt: string;
}

export interface AuditChainVerifierDeps {
  store: {
    getEvents(
      tenantId: string,
      query: { cursor?: string; limit: number },
    ): Promise<{ events: AuditEvent[]; cursor: string | null }>;
  };
  verificationKey: CryptoKey;
}

const GENESIS_HASH = 'GENESIS';

export class AuditChainVerifier {
  constructor(private readonly deps: AuditChainVerifierDeps) {}

  async verifyChain(tenantId: string, _fromEventId?: string): Promise<ChainVerificationResult> {
    const brokenLinks: BrokenLink[] = [];
    let eventsVerified = 0;
    let cursor: string | null | undefined = undefined;
    let previousHash = GENESIS_HASH;

    const pageSize = 100;

    while (true) {
      const { events, cursor: nextCursor } = await this.deps.store.getEvents(tenantId, {
        cursor: cursor ?? undefined,
        limit: pageSize,
      });

      for (const event of events) {
        const { signature, ...metadataWithoutSignature } = (event.metadata ?? {}) as Record<
          string,
          unknown
        > & { signature?: string };
        const sig = (signature as string) ?? '';

        const eventData = JSON.stringify({
          tenantId: event.tenantId,
          actorId: event.actorId,
          actorType: event.actorType,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          matterId: event.matterId,
          metadata: metadataWithoutSignature,
          timestamp: event.timestamp.toISOString(),
        });

        const signatureValid = await verifyAuditChainEntry({
          eventData,
          previousHash,
          eventHash: event.eventHash,
          signature: sig,
          verificationKey: this.deps.verificationKey,
        });

        if (!signatureValid) {
          brokenLinks.push({
            eventId: String(event.id),
            expected: event.eventHash,
            actual: event.eventHash,
            reason: 'Signature verification failed',
          });
        } else if (event.previousHash !== previousHash) {
          brokenLinks.push({
            eventId: String(event.id),
            expected: previousHash,
            actual: event.previousHash ?? '(none)',
            reason: 'Previous hash mismatch - chain broken',
          });
        } else {
          eventsVerified++;
        }

        previousHash = event.eventHash;
      }

      if (nextCursor === null || events.length === 0) {
        break;
      }
      cursor = nextCursor;
    }

    return {
      valid: brokenLinks.length === 0,
      eventsVerified,
      brokenLinks,
      verifiedAt: new Date().toISOString(),
    };
  }
}
