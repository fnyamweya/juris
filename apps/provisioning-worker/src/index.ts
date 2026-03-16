import { createCloudflareApiClient } from '@jusris/cloudflare';
import { createD1Client } from '@jusris/data';
import type { D1Database } from '@jusris/data';
import { createRequestContext, createLogger } from '@jusris/observability';

import type { ProvisioningWorkerEnv } from './env.js';
import { TenantProvisioningOrchestrator } from './orchestrator/tenant-provisioning-orchestrator.js';
import { handleHealthCheck } from './routes/health.js';

export default {
  async queue(
    batch: MessageBatch,
    env: ProvisioningWorkerEnv,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const reqCtx = createRequestContext({
      worker: 'provisioning',
      route: 'queue',
    });
    const logger = createLogger({
      level: (env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      worker: 'provisioning',
      baseContext: { requestId: reqCtx.requestId, traceId: reqCtx.traceId },
    });

    const db = createD1Client(env.MASTER_REGISTRY_DB as unknown as D1Database, logger);
    const cfApi = createCloudflareApiClient({
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: env.CLOUDFLARE_API_TOKEN,
      logger,
    });
    const orchestrator = new TenantProvisioningOrchestrator({ db, cfApi, logger });

    for (const message of batch.messages) {
      try {
        const body = message.body as {
          tenantId: string;
          idempotencyKey: string;
          action?: 'provision' | 'deprovision';
        };
        const { tenantId, idempotencyKey } = body;
        if (!tenantId || !idempotencyKey) {
          logger.warn('invalid message body', { body });
          message.ack();
          continue;
        }

        const result = await orchestrator.provision(tenantId, idempotencyKey);
        if (result.success) {
          message.ack();
        } else if ((result.retriesRemaining ?? 0) > 0) {
          message.retry();
        } else {
          message.ack();
        }
      } catch (err) {
        logger.error('queue message processing failed', {
          error: err instanceof Error ? err.message : String(err),
        });
        message.retry();
      }
    }
  },

  async fetch(
    request: Request,
    _env: ProvisioningWorkerEnv,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const reqCtx = createRequestContext({
      worker: 'provisioning',
      route: url.pathname,
    });

    if (url.pathname === '/health' || url.pathname === '/api/v1/health') {
      return handleHealthCheck(reqCtx);
    }

    return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
