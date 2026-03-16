import { createRequestContext, createLogger } from '@juris/observability';
import { applySecurityHeaders } from '@juris/security';

import { createAuthGateForDispatch } from './auth/gate.js';
import type { DispatchWorkerEnv } from './env.js';
import { handleTenantDispatch } from './routes/dispatch.js';
import { handleHealthCheck } from './routes/health.js';
import { handleTenantStatus } from './routes/tenant-status.js';

export default {
  async fetch(request: Request, env: DispatchWorkerEnv, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const reqCtx = createRequestContext({ worker: 'dispatch', route: url.pathname });
    const logger = createLogger({
      level: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      worker: 'dispatch',
      baseContext: { requestId: reqCtx.requestId, traceId: reqCtx.traceId },
    });

    try {
      if (url.pathname === '/health' || url.pathname === '/api/v1/health') {
        return applySecurityHeaders(handleHealthCheck(reqCtx));
      }

      if (request.method === 'OPTIONS') {
        return applySecurityHeaders(new Response(null, { status: 204 }));
      }

      const authGate = createAuthGateForDispatch(env, logger);
      const authResult = await authGate.authenticate(request);

      if (!authResult.authenticated) {
        logger.warn('authentication failed', {
          code: authResult.error.code,
          route: url.pathname,
        });
        return applySecurityHeaders(
          new Response(
            JSON.stringify({
              error: {
                code: authResult.error.code,
                message: authResult.error.message,
                requestId: reqCtx.requestId,
              },
            }),
            {
              status: authResult.error.status,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }

      const actor = authResult.actor;
      logger.info('request authenticated', {
        tenantId: actor.tenantId,
        actorId: actor.principal.id,
        route: url.pathname,
      });

      if (url.pathname.startsWith('/api/v1/tenants/') && url.pathname.endsWith('/status')) {
        return applySecurityHeaders(await handleTenantStatus(request, env, actor, reqCtx, logger));
      }

      return applySecurityHeaders(await handleTenantDispatch(request, env, actor, reqCtx, logger));
    } catch (error) {
      logger.error('unhandled dispatch error', {
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
