import { createRequestContext, createLogger } from '@jusris/observability';
import { handleHealthCheck } from './routes/health.js';
import type { WebhookWorkerEnv } from './env.js';

export default {
  async fetch(
    request: Request,
    env: WebhookWorkerEnv,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const reqCtx = createRequestContext({
      worker: 'webhooks',
      route: url.pathname,
    });
    const logger = createLogger({
      level: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      worker: 'webhooks',
      baseContext: { requestId: reqCtx.requestId, traceId: reqCtx.traceId },
    });

    try {
      if (url.pathname === '/health' || url.pathname === '/api/v1/health') {
        return handleHealthCheck(reqCtx);
      }

      if (url.pathname.startsWith('/webhooks/')) {
        await request.text();
        logger.info('webhook received', {
          path: url.pathname,
          contentType: request.headers.get('content-type'),
        });

        return new Response(
          JSON.stringify({ received: true, requestId: reqCtx.requestId }),
          { status: 202, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      logger.error('webhook error', {
        error: error instanceof Error ? error.message : 'unknown',
      });
      return new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An internal error occurred',
            requestId: reqCtx.requestId,
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
