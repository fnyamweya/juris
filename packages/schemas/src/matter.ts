import { z } from 'zod';
import { MatterStatus, MatterType } from '@jusris/domain/matter';
import { ulidSchema, cursorPaginationSchema } from './common.js';

export const createMatterRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional(),
  type: z.nativeEnum(MatterType),
  caseNumber: z.string().max(100).optional(),
  clientId: ulidSchema.optional(),
});

export const updateMatterRequestSchema = createMatterRequestSchema.partial();

export const matterResponseSchema = z.object({
  id: ulidSchema,
  tenantId: ulidSchema,
  title: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(MatterType),
  status: z.nativeEnum(MatterStatus),
  caseNumber: z.string().optional(),
  clientId: ulidSchema.optional(),
  leadCounselId: ulidSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  closedAt: z.string().datetime().optional(),
});

export const matterListQuerySchema = cursorPaginationSchema.extend({
  status: z.nativeEnum(MatterStatus).optional(),
  type: z.nativeEnum(MatterType).optional(),
  search: z.string().max(200).optional(),
});
