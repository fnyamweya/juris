import type { DocumentClassification } from '@jusris/domain';

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  pageNumber?: number;
  score: number;
}

export interface RetrievalRequest {
  tenantId: string;
  query: string;
  matterId?: string;
  topK: number;
  filterClassification?: DocumentClassification[];
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  queryEmbedding: number[];
}

export interface RetrievalOrchestrator {
  retrieve(params: RetrievalRequest): Promise<RetrievalResult>;
}
