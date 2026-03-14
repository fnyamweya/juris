export type { EmbeddingClient } from './embedding-client.js';
export { createEmbeddingClient } from './embedding-client.js';

export type {
  RetrievalOrchestrator,
  RetrievalRequest,
  RetrievalResult,
  RetrievedChunk,
} from './retrieval-orchestrator.js';

export { assemblePrompt } from './prompt-assembly.js';
export type { AssembledPrompt, AssemblePromptParams } from './prompt-assembly.js';

export { extractCitations } from './citation-extractor.js';
export type { ExtractCitationsParams } from './citation-extractor.js';
