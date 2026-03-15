import { createRequestContext, createLogger } from '@jusris/observability';
import { handleHealthCheck } from './routes/health.js';
import type { MaintenanceWorkerEnv } from './env.js';

export default {
  async scheduled(
    event: ScheduledEvent,
    env: MaintenanceWorkerEnv,
    _ctx: ExecutionContext
  ): Promise<void> {
    const reqCtx = createRequestContext({
      worker: 'maintenance',
      route: 'scheduled',
    });
    const logger = createLogger({
      level: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      worker: 'maintenance',
      baseContext: { requestId: reqCtx.requestId, traceId: reqCtx.traceId },
    });

    const cron = event.cron;

    try {
      if (cron === '0 */6 * * *') {
        logger.info('running cleanup job');
      }

      if (cron === '0 0 * * *') {
        logger.info('running billing rollup job');
      }
    } catch (err) {
      logger.error('scheduled job failed', {
        cron,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },

  async fetch(
    request: Request,
    _env: MaintenanceWorkerEnv,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const reqCtx = createRequestContext({
      worker: 'maintenance',
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
