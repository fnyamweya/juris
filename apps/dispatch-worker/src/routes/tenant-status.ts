import type { ActorContext } from '@juris/domain';
import type { RequestContext, Logger } from '@juris/observability';

import type { DispatchWorkerEnv } from '../env.js';

export async function handleTenantStatus(
  request: Request,
  env: DispatchWorkerEnv,
  actor: ActorContext,
  reqCtx: RequestContext,
  logger: Logger,
): Promise<Response> {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const tenantId = segments[4];

  if (!tenantId) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing tenant ID',
          requestId: reqCtx.requestId,
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (tenantId !== actor.tenantId) {
    logger.warn('tenant status access denied: cross-tenant', {
      requestedTenant: tenantId,
      actorTenant: actor.tenantId,
    });
    return new Response(
      JSON.stringify({
        error: { code: 'FORBIDDEN', message: 'Access denied', requestId: reqCtx.requestId },
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const tenant = await env.MASTER_REGISTRY_DB.prepare(
    'SELECT id, slug, display_name, tier, status, custom_domain, created_at, updated_at FROM tenants WHERE id = ?',
  )
    .bind(tenantId)
    .first();

  if (!tenant) {
    return new Response(
      JSON.stringify({
        error: { code: 'NOT_FOUND', message: 'Tenant not found', requestId: reqCtx.requestId },
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const operation = await env.MASTER_REGISTRY_DB.prepare(
    'SELECT current_step, status, updated_at FROM provisioning_operations WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1',
  )
    .bind(tenantId)
    .first();

  return new Response(
    JSON.stringify({
      data: {
        tenant,
        provisioning: operation || null,
      },
      requestId: reqCtx.requestId,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}
