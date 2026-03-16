import type { IngestionJob, Result } from '@jusris/domain';
import type { Logger } from '@jusris/observability';

import type { ChunkingStrategy } from './chunker.js';
import type { RedactionDetector } from './redaction-detector.js';
import type { TextExtractor } from './text-extractor.js';

export interface IngestionDeps {
  extractor: TextExtractor;
  chunker: ChunkingStrategy;
  redactionDetector: RedactionDetector;
  logger: Logger;
}

export interface IngestionResult {
  text: string;
  chunks: { content: string; chunkIndex: number; pageNumber?: number; anchorRef?: string }[];
  redactions: {
    startOffset: number;
    endOffset: number;
    category: string;
    confidence: number;
    matchedText: string;
  }[];
}

export interface EvidenceIngestionPipeline {
  process(job: IngestionJob, deps: IngestionDeps): Promise<Result<IngestionResult, unknown>>;
}

export function createEvidenceIngestionPipeline(): EvidenceIngestionPipeline {
  return {
    async process(
      job: IngestionJob,
      deps: IngestionDeps,
    ): Promise<Result<IngestionResult, unknown>> {
      const { extractor, chunker, redactionDetector, logger } = deps;

      try {
        logger.info('Starting ingestion', {
          jobId: job.id,
          documentId: job.documentId,
          tenantId: job.tenantId,
        });

        const rawContent = job.stepDetails?.['content'];
        const content = rawContent instanceof ArrayBuffer ? rawContent : new ArrayBuffer(0);
        const rawMime = job.stepDetails?.['mimeType'];
        const mimeType = typeof rawMime === 'string' ? rawMime : 'application/octet-stream';
        const rawFilename = job.stepDetails?.['filename'];
        const filename = typeof rawFilename === 'string' ? rawFilename : 'document';

        const extraction = await extractor.extract({
          content,
          mimeType,
          filename,
        });

        const redactions = redactionDetector.detect(extraction.text);

        const chunks = chunker.chunk(extraction.text, {
          maxTokens: 512,
          overlapTokens: 50,
          preserveStructure: true,
        });

        const result: IngestionResult = {
          text: extraction.text,
          chunks: chunks.map((c) => ({
            content: c.content,
            chunkIndex: c.chunkIndex,
            pageNumber: c.pageNumber,
            anchorRef: c.anchorRef,
          })),
          redactions: redactions.map((r) => ({
            startOffset: r.startOffset,
            endOffset: r.endOffset,
            category: r.category,
            confidence: r.confidence,
            matchedText: r.matchedText,
          })),
        };

        logger.info('Ingestion complete', {
          jobId: job.id,
          chunkCount: chunks.length,
          redactionCount: redactions.length,
        });

        return { ok: true, value: result };
      } catch (error) {
        logger.error('Ingestion failed', {
          jobId: job.id,
          error: String(error),
        });
        return {
          ok: false,
          error: error instanceof Error ? error : { message: String(error) },
        };
      }
    },
  };
}
