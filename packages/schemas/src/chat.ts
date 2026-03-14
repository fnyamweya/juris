import { z } from 'zod';
import { ChatMessageRole } from '@jusris/domain/chat';
import { ulidSchema, cursorPaginationSchema } from './common.js';

export const createConversationRequestSchema = z.object({
  matterId: ulidSchema.optional(),
  title: z.string().max(200).optional(),
});

export const sendMessageRequestSchema = z.object({
  conversationId: ulidSchema,
  content: z.string().min(1, 'Message content is required').max(10000),
});

export const citationSchema = z.object({
  chunkId: z.string(),
  documentId: z.string(),
  documentTitle: z.string(),
  pageNumber: z.number().optional(),
  excerpt: z.string(),
  relevanceScore: z.number(),
});

export const chatMessageResponseSchema = z.object({
  id: ulidSchema,
  conversationId: ulidSchema,
  role: z.nativeEnum(ChatMessageRole),
  content: z.string(),
  citations: z.array(citationSchema),
  retrievedChunkIds: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export const conversationListQuerySchema = cursorPaginationSchema.extend({
  matterId: ulidSchema.optional(),
});
