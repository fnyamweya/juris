import { createRequestContext, createLogger } from '@juris/observability';
import { applySecurityHeaders } from '@juris/security';

import type { TenantRuntimeWorkerEnv } from './env.js';
import { extractInternalContext } from './middleware/internal-auth.js';
import { handleConversations } from './routes/conversations.js';
import { handleDocuments } from './routes/documents.js';
import { handleHealthCheck } from './routes/health.js';
import { handleMatters } from './routes/matters.js';
import { handleSearch } from './routes/search.js';

export default {
  async fetch(
    request: Request,
    env: TenantRuntimeWorkerEnv,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const reqCtx = createRequestContext({
      worker: 'tenant-runtime',
      route: url.pathname,
    });
    const logger = createLogger({
      level: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      worker: 'tenant-runtime',
      baseContext: { requestId: reqCtx.requestId, traceId: reqCtx.traceId },
    });

    try {
      if (url.pathname === '/health' || url.pathname === '/api/v1/health') {
        return applySecurityHeaders(handleHealthCheck(reqCtx));
      }

      const actor = extractInternalContext(request);
      if (!actor) {
        logger.warn('missing internal headers', { path: url.pathname });
        return applySecurityHeaders(
          new Response(
            JSON.stringify({
              error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid or missing internal context',
                requestId: reqCtx.requestId,
              },
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }

      const path = url.pathname;

      if (path.startsWith('/api/v1/matters')) {
        return applySecurityHeaders(await handleMatters(request, env, actor, reqCtx, logger));
      }
      if (path.startsWith('/api/v1/documents')) {
        return applySecurityHeaders(await handleDocuments(request, env, actor, reqCtx, logger));
      }
      if (path.startsWith('/api/v1/conversations')) {
        return applySecurityHeaders(await handleConversations(request, env, actor, reqCtx, logger));
      }
      if (path.startsWith('/api/v1/search')) {
        return applySecurityHeaders(await handleSearch(request, env, actor, reqCtx, logger));
      }

      return applySecurityHeaders(
        new Response(
          JSON.stringify({
            error: { code: 'NOT_FOUND', message: 'Not found', requestId: reqCtx.requestId },
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    } catch (error) {
      logger.error('unhandled tenant runtime error', {
        error: error instanceof Error ? error.message : 'unknown',
      });
      return applySecurityHeaders(
        new Response(
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
          },
        ),
      );
    }
  },
};
