import type { PrincipalId } from '../identity/index.js';
import type { MatterId } from '../matter/index.js';
import type { TenantId } from '../tenant/index.js';

export type DocumentId = string & { readonly __brand: unique symbol };

export function createDocumentId(value: string): DocumentId {
  return value as DocumentId;
}

export enum DocumentStatus {
  PENDING_UPLOAD = 'PENDING_UPLOAD',
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  AVAILABLE = 'AVAILABLE',
  REDACTED = 'REDACTED',
  QUARANTINED = 'QUARANTINED',
  DELETED = 'DELETED',
}

export enum DocumentClassification {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  PRIVILEGED = 'PRIVILEGED',
  RESTRICTED = 'RESTRICTED',
}

export interface Document {
  id: DocumentId;
  tenantId: TenantId;
  matterId?: MatterId;
  title: string;
  mimeType: string;
  sizeBytes: number;
  classification: DocumentClassification;
  status: DocumentStatus;
  uploadedBy: PrincipalId;
  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptionEnvelope {
  wrappedDek: string;
  iv: string;
  algorithm: string;
  aad?: string;
  kekVersion: string;
}

export interface DocumentVersion {
  id: string;
  documentId: DocumentId;
  version: number;
  storageKey: string;
  encryptionEnvelope?: EncryptionEnvelope;
  createdAt: Date;
}
