import { DocumentClassification, DocumentStatus } from '@jusris/domain/document';
import { z } from 'zod';

import { ulidSchema, cursorPaginationSchema } from './common.js';

const MAX_DOCUMENT_SIZE_BYTES = 100 * 1024 * 1024;

export const initiateUploadRequestSchema = z.object({
  matterId: ulidSchema,
  title: z.string().min(1, 'Title is required').max(500),
  mimeType: z.string(),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_DOCUMENT_SIZE_BYTES, `File size must not exceed 100MB`),
  classification: z.nativeEnum(DocumentClassification),
});

export const documentResponseSchema = z.object({
  id: ulidSchema,
  tenantId: ulidSchema,
  matterId: ulidSchema.optional(),
  title: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  classification: z.nativeEnum(DocumentClassification),
  status: z.nativeEnum(DocumentStatus),
  uploadedBy: ulidSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const documentListQuerySchema = cursorPaginationSchema.extend({
  matterId: ulidSchema.optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  classification: z.nativeEnum(DocumentClassification).optional(),
});
