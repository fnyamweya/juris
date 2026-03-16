import { AuditAction } from '@juris/domain';
import type { AuditEvent, PrincipalType } from '@juris/domain';

import { type AuditTrailWriter } from './audit-trail-writer.js';

export interface DocumentCustodyParams {
  tenantId: string;
  actorId: string;
  actorType: PrincipalType;
  documentId: string;
  documentTitle?: string;
  matterId?: string;
  metadata?: Record<string, unknown>;
}

export class DocumentCustodyLedger {
  constructor(private readonly writer: AuditTrailWriter) {}

  async recordUpload(params: DocumentCustodyParams): Promise<AuditEvent> {
    return this.writer.write({
      ...params,
      action: AuditAction.DOCUMENT_UPLOADED,
      resourceType: 'document',
      resourceId: params.documentId,
      metadata: {
        ...params.metadata,
        documentTitle: params.documentTitle,
      },
    });
  }

  async recordView(params: DocumentCustodyParams): Promise<AuditEvent> {
    return this.writer.write({
      ...params,
      action: AuditAction.DOCUMENT_VIEWED,
      resourceType: 'document',
      resourceId: params.documentId,
      metadata: {
        ...params.metadata,
        documentTitle: params.documentTitle,
      },
    });
  }

  async recordDownload(params: DocumentCustodyParams): Promise<AuditEvent> {
    return this.writer.write({
      ...params,
      action: AuditAction.DOCUMENT_DOWNLOADED,
      resourceType: 'document',
      resourceId: params.documentId,
      metadata: {
        ...params.metadata,
        documentTitle: params.documentTitle,
      },
    });
  }

  async recordShare(params: DocumentCustodyParams): Promise<AuditEvent> {
    return this.writer.write({
      ...params,
      action: AuditAction.DOCUMENT_SHARED,
      resourceType: 'document',
      resourceId: params.documentId,
      metadata: {
        ...params.metadata,
        documentTitle: params.documentTitle,
      },
    });
  }

  async recordRevocation(params: DocumentCustodyParams): Promise<AuditEvent> {
    return this.writer.write({
      ...params,
      action: AuditAction.SHARE_REVOKED,
      resourceType: 'document',
      resourceId: params.documentId,
      metadata: {
        ...params.metadata,
        documentTitle: params.documentTitle,
      },
    });
  }

  async recordDeletion(params: DocumentCustodyParams): Promise<AuditEvent> {
    return this.writer.write({
      ...params,
      action: AuditAction.DOCUMENT_DELETED,
      resourceType: 'document',
      resourceId: params.documentId,
      metadata: {
        ...params.metadata,
        documentTitle: params.documentTitle,
      },
    });
  }
}
