import type { ActorContext, TenantId } from '@juris/domain';
import { createPrincipalId, PrincipalType } from '@juris/domain';

const HEADER_TENANT_ID = 'x-juris-tenant-id';
const HEADER_ACTOR_ID = 'x-juris-actor-id';
const HEADER_REQUEST_ID = 'x-juris-request-id';
const HEADER_TRACE_ID = 'x-juris-trace-id';

export function extractInternalContext(request: Request): ActorContext | null {
  const tenantId = request.headers.get(HEADER_TENANT_ID);
  const actorId = request.headers.get(HEADER_ACTOR_ID);

  if (!tenantId || !actorId) {
    return null;
  }

  return {
    tenantId: tenantId as TenantId,
    principal: {
      id: createPrincipalId(actorId),
      tenantId: tenantId as TenantId,
      type: PrincipalType.INTERNAL_USER,
      status: 'active',
      createdAt: new Date(),
    },
    requestId: request.headers.get(HEADER_REQUEST_ID) ?? undefined,
    traceId: request.headers.get(HEADER_TRACE_ID) ?? undefined,
  };
}
