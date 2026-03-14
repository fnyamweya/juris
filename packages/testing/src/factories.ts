import type {
  Tenant,
  Principal,
  ActorContext,
  Matter,
  Document,
  AuditEvent,
  IngestionJob,
} from '@jusris/domain';
import {
  createTenantId,
  createPrincipalId,
  createMatterId,
  createDocumentId,
  createAuditEventId,
  createIngestionJobId,
  TenantTier,
  TenantStatus,
  PrincipalType,
  MatterType,
  MatterStatus,
  DocumentStatus,
  DocumentClassification,
  AuditAction,
  IngestionStatus,
} from '@jusris/domain';

function ulidLike(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 10).toUpperCase();
  return (t + r).padEnd(26, '0').slice(0, 26);
}

export function createTestTenant(overrides?: Partial<Tenant>): Tenant {
  const id = ulidLike();
  return {
    id: createTenantId(id),
    slug: `tenant-${id.slice(0, 8)}`,
    displayName: 'Test Tenant',
    tier: TenantTier.PROFESSIONAL,
    status: TenantStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestPrincipal(overrides?: Partial<Principal>): Principal {
  const id = ulidLike();
  const tenantId = overrides?.tenantId ?? createTenantId(ulidLike());
  return {
    id: createPrincipalId(id),
    tenantId,
    type: PrincipalType.INTERNAL_USER,
    email: 'test@example.com',
    displayName: 'Test User',
    status: 'ACTIVE',
    createdAt: new Date(),
    ...overrides,
  };
}

export function createTestActorContext(overrides?: Partial<ActorContext>): ActorContext {
  const principal = overrides?.principal ?? createTestPrincipal();
  return {
    principal,
    tenantId: principal.tenantId,
    requestId: `req-${ulidLike()}`,
    traceId: `trace-${ulidLike()}`,
    ...overrides,
  };
}

export function createTestMatter(overrides?: Partial<Matter>): Matter {
  const id = ulidLike();
  const tenantId = overrides?.tenantId ?? createTenantId(ulidLike());
  return {
    id: createMatterId(id),
    tenantId,
    title: 'Test Matter',
    type: MatterType.LITIGATION,
    status: MatterStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestDocument(overrides?: Partial<Document>): Document {
  const id = ulidLike();
  const tenantId = overrides?.tenantId ?? createTenantId(ulidLike());
  return {
    id: createDocumentId(id),
    tenantId,
    title: 'Test Document.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    classification: DocumentClassification.INTERNAL,
    status: DocumentStatus.AVAILABLE,
    uploadedBy: createPrincipalId(ulidLike()),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestAuditEvent(overrides?: Partial<AuditEvent>): AuditEvent {
  const id = ulidLike();
  const tenantId = overrides?.tenantId ?? createTenantId(ulidLike());
  return {
    id: createAuditEventId(id),
    tenantId,
    actorId: createPrincipalId(ulidLike()),
    actorType: String(PrincipalType.INTERNAL_USER),
    action: AuditAction.DOCUMENT_UPLOADED,
    resourceType: 'document',
    resourceId: ulidLike(),
    metadata: {},
    previousHash: 'GENESIS',
    eventHash: `hash-${ulidLike()}`,
    signatureVersion: '1',
    timestamp: new Date(),
    ...overrides,
  };
}

export function createTestIngestionJob(overrides?: Partial<IngestionJob>): IngestionJob {
  const id = ulidLike();
  const tenantId = overrides?.tenantId ?? createTenantId(ulidLike());
  const documentId = overrides?.documentId ?? createDocumentId(ulidLike());
  return {
    id: createIngestionJobId(id),
    tenantId,
    documentId,
    status: IngestionStatus.QUEUED,
    retriesRemaining: 3,
    idempotencyKey: `key-${ulidLike()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
