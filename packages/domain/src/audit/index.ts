import type { TenantId } from '../tenant/index.js';
import type { PrincipalId } from '../identity/index.js';
import type { MatterId } from '../matter/index.js';

export type AuditEventId = string & { readonly __brand: unique symbol };

export function createAuditEventId(value: string): AuditEventId {
  return value as AuditEventId;
}

export enum AuditAction {
  TENANT_CREATED = 'TENANT_CREATED',
  TENANT_PROVISIONED = 'TENANT_PROVISIONED',
  TENANT_SUSPENDED = 'TENANT_SUSPENDED',
  TENANT_DELETED = 'TENANT_DELETED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REVOKED = 'ROLE_REVOKED',
  MATTER_CREATED = 'MATTER_CREATED',
  MATTER_UPDATED = 'MATTER_UPDATED',
  MATTER_CLOSED = 'MATTER_CLOSED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
  DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
  REDACTION_APPLIED = 'REDACTION_APPLIED',
  REDACTION_REVIEWED = 'REDACTION_REVIEWED',
  SEARCH_PERFORMED = 'SEARCH_PERFORMED',
  CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  POLICY_UPDATED = 'POLICY_UPDATED',
  KEY_ROTATED = 'KEY_ROTATED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_PURGED = 'DATA_PURGED',
  SHARE_CREATED = 'SHARE_CREATED',
  SHARE_REVOKED = 'SHARE_REVOKED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  ADMIN_ACTION = 'ADMIN_ACTION',
}

export interface AuditEvent {
  id: AuditEventId;
  tenantId: TenantId;
  actorId: PrincipalId;
  actorType: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  matterId?: MatterId;
  metadata: Record<string, unknown>;
  previousHash?: string;
  eventHash: string;
  signatureVersion: string;
  timestamp: Date;
}
