import type { TenantId } from '../tenant/index.js';

export type PrincipalId = string & { readonly __brand: unique symbol };

export function createPrincipalId(value: string): PrincipalId {
  return value as PrincipalId;
}

export enum PrincipalType {
  INTERNAL_USER = 'INTERNAL_USER',
  EXTERNAL_CLIENT = 'EXTERNAL_CLIENT',
  SERVICE_ACCOUNT = 'SERVICE_ACCOUNT',
  SYSTEM = 'SYSTEM',
}

export interface Principal {
  id: PrincipalId;
  tenantId: TenantId;
  type: PrincipalType;
  email?: string;
  displayName?: string;
  status: string;
  createdAt: Date;
}

export interface ActorContext {
  principal: Principal;
  tenantId: TenantId;
  requestId?: string;
  traceId?: string;
}

export interface SessionInfo {
  actorContext: ActorContext;
  authenticatedAt: Date;
  expiresAt: Date;
  authMethod: string;
}
