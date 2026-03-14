export type TenantId = string & { readonly __brand: unique symbol };

export function createTenantId(value: string): TenantId {
  return value as TenantId;
}

export enum TenantStatus {
  INITIATED = 'INITIATED',
  PROVISIONING = 'PROVISIONING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEPROVISION_REQUESTED = 'DEPROVISION_REQUESTED',
  DEPROVISIONING = 'DEPROVISIONING',
  DELETED = 'DELETED',
}

export enum TenantTier {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  REGULATED = 'REGULATED',
}

export interface Tenant {
  id: TenantId;
  slug: string;
  displayName: string;
  tier: TenantTier;
  status: TenantStatus;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TenantResourceType {
  D1 = 'D1',
  R2 = 'R2',
  VECTORIZE = 'VECTORIZE',
  WORKER = 'WORKER',
}

export interface TenantResource {
  tenantId: TenantId;
  resourceType: TenantResourceType;
  resourceId: string;
  status: string;
  provisionedAt: Date;
}
