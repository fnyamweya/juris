import type { ActorContext } from '@jusris/domain';
import type { RequestContext, Logger } from '@jusris/observability';

import type { TenantRuntimeWorkerEnv } from '../env.js';

export async function handleSearch(
  request: Request,
  _env: TenantRuntimeWorkerEnv,
  actor: ActorContext,
  reqCtx: RequestContext,
  logger: Logger,
): Promise<Response> {
  logger.info('search route', { tenantId: actor.tenantId, path: new URL(request.url).pathname });
  return new Response(
    JSON.stringify({
      data: { items: [], cursor: null, hasMore: false },
      requestId: reqCtx.requestId,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}
