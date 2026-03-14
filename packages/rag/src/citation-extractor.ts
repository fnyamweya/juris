import type { Citation } from '@jusris/domain';
import { createChunkId, createDocumentId } from '@jusris/domain';
import type { RetrievedChunk } from './retrieval-orchestrator.js';

export interface ExtractCitationsParams {
  response: string;
  includedChunks: RetrievedChunk[];
}

const CHUNK_REF_PATTERN = /\[([a-zA-Z0-9_-]+)\]/g;

export function extractCitations(params: ExtractCitationsParams): Citation[] {
  const { response, includedChunks } = params;
  const chunkMap = new Map(includedChunks.map((c) => [c.chunkId, c]));
  const citations: Citation[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  const re = new RegExp(CHUNK_REF_PATTERN.source, CHUNK_REF_PATTERN.flags);
  while ((match = re.exec(response)) !== null) {
    const chunkId = match[1];
    if (!chunkId || seen.has(chunkId)) continue;

    const chunk = chunkMap.get(chunkId);
    if (!chunk) continue;

    seen.add(chunkId);

    const excerpt = chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : '');

    citations.push({
      chunkId: createChunkId(chunkId),
      documentId: createDocumentId(chunk.documentId),
      documentTitle: chunk.documentTitle,
      pageNumber: chunk.pageNumber,
      excerpt,
      relevanceScore: chunk.score,
    });
  }

  return citations;
}
