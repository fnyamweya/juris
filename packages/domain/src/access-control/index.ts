import type { ActorContext, PrincipalId } from '../identity/index.js';
import type { MatterId } from '../matter/index.js';
import type { TenantId } from '../tenant/index.js';

export enum Permission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  ADMIN = 'ADMIN',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  REDACT = 'REDACT',
  SEARCH = 'SEARCH',
  CHAT = 'CHAT',
}

export enum RoleBindingScope {
  TENANT = 'TENANT',
  MATTER = 'MATTER',
  DOCUMENT = 'DOCUMENT',
}

export interface Role {
  id: string;
  tenantId: TenantId;
  name: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
}

export interface RoleBinding {
  principalId: PrincipalId;
  roleId: string;
  scope: RoleBindingScope;
  scopeId?: string;
  grantedAt: Date;
  grantedBy: PrincipalId;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  policyVersion: string;
}

export interface AccessRequest {
  actor: ActorContext;
  action: Permission;
  resourceType: string;
  resourceId: string;
  matterId?: MatterId;
}
