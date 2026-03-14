import type { TenantId } from '../tenant/index.js';
import type { MatterId } from '../matter/index.js';
import type { PrincipalId } from '../identity/index.js';
import type { DocumentId } from '../document/index.js';
import type { ChunkId } from '../ingestion/index.js';

export type ConversationId = string & { readonly __brand: unique symbol };

export function createConversationId(value: string): ConversationId {
  return value as ConversationId;
}

export type ChatMessageId = string & { readonly __brand: unique symbol };

export function createChatMessageId(value: string): ChatMessageId {
  return value as ChatMessageId;
}

export enum ConversationScope {
  TENANT_WIDE = 'TENANT_WIDE',
  MATTER_SCOPED = 'MATTER_SCOPED',
}

export enum ChatMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export interface Citation {
  chunkId: ChunkId;
  documentId: DocumentId;
  documentTitle: string;
  pageNumber?: number;
  excerpt: string;
  relevanceScore: number;
}

export interface Conversation {
  id: ConversationId;
  tenantId: TenantId;
  matterId?: MatterId;
  scope: ConversationScope;
  createdBy: PrincipalId;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: ChatMessageId;
  conversationId: ConversationId;
  role: ChatMessageRole;
  content: string;
  citations: Citation[];
  retrievedChunkIds: ChunkId[];
  createdAt: Date;
}
