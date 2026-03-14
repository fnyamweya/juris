import { createRequestContext, createLogger } from '@jusris/observability';
import { handleHealthCheck } from './routes/health.js';
import type { IngestionWorkerEnv } from './env.js';

export default {
  async queue(
    batch: MessageBatch,
    env: IngestionWorkerEnv,
    _ctx: ExecutionContext
  ): Promise<void> {
    const reqCtx = createRequestContext({
      worker: 'ingestion',
      route: 'queue',
    });
    const logger = createLogger({
      level: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      worker: 'ingestion',
      baseContext: { requestId: reqCtx.requestId, traceId: reqCtx.traceId },
    });

    for (const message of batch.messages) {
      try {
        const body = message.body as {
          tenantId: string;
          documentId: string;
          blobKey?: string;
          mimeType?: string;
        };
        const { tenantId, documentId } = body;
        if (!tenantId || !documentId) {
          logger.warn('invalid ingestion message body', { body });
          message.ack();
          continue;
        }

        logger.info('processing ingestion job', {
          tenantId,
          documentId,
          blobKey: body.blobKey,
        });

        message.ack();
      } catch (err) {
        logger.error('ingestion message processing failed', {
          error: err instanceof Error ? err.message : String(err),
        });
        message.retry();
      }
    }
  },

  async fetch(
    request: Request,
    env: IngestionWorkerEnv,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const reqCtx = createRequestContext({
      worker: 'ingestion',
      route: url.pathname,
    });

    if (url.pathname === '/health' || url.pathname === '/api/v1/health') {
      return handleHealthCheck(reqCtx);
    }

    return new Response(
      JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  },
};
