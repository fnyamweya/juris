import type { DocumentId } from '../document/index.js';
import type { PrincipalId } from '../identity/index.js';
import type { TenantId } from '../tenant/index.js';

export type IngestionJobId = string & { readonly __brand: unique symbol };

export function createIngestionJobId(value: string): IngestionJobId {
  return value as IngestionJobId;
}

export enum IngestionStatus {
  QUEUED = 'QUEUED',
  FETCHING = 'FETCHING',
  EXTRACTING = 'EXTRACTING',
  CLASSIFYING = 'CLASSIFYING',
  REDACTING = 'REDACTING',
  CHUNKING = 'CHUNKING',
  EMBEDDING = 'EMBEDDING',
  INDEXING = 'INDEXING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

export interface IngestionJob {
  id: IngestionJobId;
  tenantId: TenantId;
  documentId: DocumentId;
  status: IngestionStatus;
  stepDetails?: Record<string, unknown>;
  retriesRemaining: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ChunkId = string & { readonly __brand: unique symbol };

export function createChunkId(value: string): ChunkId {
  return value as ChunkId;
}

export enum RedactionCategory {
  PII_NAME = 'PII_NAME',
  PII_SSN = 'PII_SSN',
  PII_EMAIL = 'PII_EMAIL',
  PII_PHONE = 'PII_PHONE',
  PII_ADDRESS = 'PII_ADDRESS',
  PRIVILEGED = 'PRIVILEGED',
  CUSTOM = 'CUSTOM',
}

export enum RedactionMethod {
  DETERMINISTIC = 'DETERMINISTIC',
  AI_ASSISTED = 'AI_ASSISTED',
}

export interface DocumentChunk {
  id: ChunkId;
  documentId: DocumentId;
  tenantId: TenantId;
  chunkIndex: number;
  content: string;
  pageNumber?: number;
  anchorRef?: string;
  embeddingId?: string;
}

export interface RedactionSpan {
  documentId: DocumentId;
  startOffset: number;
  endOffset: number;
  category: RedactionCategory | string;
  confidence: number;
  method: RedactionMethod;
  reviewedBy?: PrincipalId;
  reviewedAt?: Date;
}
