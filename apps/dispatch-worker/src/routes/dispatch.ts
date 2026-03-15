import type { ActorContext } from '@jusris/domain';
import type { RequestContext, Logger } from '@jusris/observability';
import { stripUntrustedHeaders } from '../headers.js';
import type { DispatchWorkerEnv } from '../env.js';

const INTERNAL_TENANT_HEADER = 'x-jusris-tenant-id';
const INTERNAL_ACTOR_HEADER = 'x-jusris-actor-id';
const INTERNAL_ACTOR_TYPE_HEADER = 'x-jusris-actor-type';
const INTERNAL_REQUEST_ID_HEADER = 'x-jusris-request-id';
const INTERNAL_TRACE_ID_HEADER = 'x-jusris-trace-id';

export async function handleTenantDispatch(
  request: Request,
  _env: DispatchWorkerEnv,
  actor: ActorContext,
  reqCtx: RequestContext,
  logger: Logger,
): Promise<Response> {
  const cleanHeaders = stripUntrustedHeaders(request.headers);

  cleanHeaders.set(INTERNAL_TENANT_HEADER, actor.tenantId);
  cleanHeaders.set(INTERNAL_ACTOR_HEADER, actor.principal.id);
  cleanHeaders.set(INTERNAL_ACTOR_TYPE_HEADER, actor.principal.type);
  cleanHeaders.set(INTERNAL_REQUEST_ID_HEADER, reqCtx.requestId);
  cleanHeaders.set(INTERNAL_TRACE_ID_HEADER, reqCtx.traceId);

  logger.info('dispatching to tenant runtime', {
    tenantId: actor.tenantId,
    method: request.method,
    path: new URL(request.url).pathname,
  });

  return new Response(
    JSON.stringify({
      error: {
        code: 'TENANT_RUNTIME_NOT_AVAILABLE',
        message: 'Tenant runtime worker is not yet deployed',
        requestId: reqCtx.requestId,
      },
    }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  );
}
