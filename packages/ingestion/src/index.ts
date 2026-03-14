export type {
  TextExtractor,
  ExtractionInput,
  ExtractionResult,
  PageContent,
} from './text-extractor.js';
export { createTextExtractor } from './text-extractor.js';

export type {
  ChunkingStrategy,
  ChunkingOptions,
  DocumentChunkInput,
} from './chunker.js';
export { createSemanticChunker } from './chunker.js';

export type {
  RedactionDetector,
  DetectedRedaction,
} from './redaction-detector.js';
export {
  createDeterministicRedactionDetector,
  REDACTION_PATTERNS,
} from './redaction-detector.js';

export type {
  EvidenceIngestionPipeline,
  IngestionDeps,
  IngestionResult,
} from './evidence-ingestion-pipeline.js';
export { createEvidenceIngestionPipeline } from './evidence-ingestion-pipeline.js';
