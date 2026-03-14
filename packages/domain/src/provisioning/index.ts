import type { TenantId } from '../tenant/index.js';

export type ProvisioningOperationId = string & { readonly __brand: unique symbol };

export function createProvisioningOperationId(value: string): ProvisioningOperationId {
  return value as ProvisioningOperationId;
}

export enum ProvisioningStep {
  INITIATED = 'INITIATED',
  REGISTRY_COMMITTED = 'REGISTRY_COMMITTED',
  D1_PROVISIONED = 'D1_PROVISIONED',
  TENANT_SCHEMA_APPLIED = 'TENANT_SCHEMA_APPLIED',
  VECTOR_INDEX_PROVISIONED = 'VECTOR_INDEX_PROVISIONED',
  R2_PROVISIONED = 'R2_PROVISIONED',
  ACCESS_POLICY_CONFIGURED = 'ACCESS_POLICY_CONFIGURED',
  CUSTOM_DOMAIN_REQUESTED = 'CUSTOM_DOMAIN_REQUESTED',
  TENANT_WORKER_DEPLOYED = 'TENANT_WORKER_DEPLOYED',
  ROUTING_REGISTERED = 'ROUTING_REGISTERED',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
  DEPROVISION_REQUESTED = 'DEPROVISION_REQUESTED',
  ACCESS_REVOKED = 'ACCESS_REVOKED',
  ROUTING_DISABLED = 'ROUTING_DISABLED',
  DATA_EXPORT_READY = 'DATA_EXPORT_READY',
  DATA_PURGED = 'DATA_PURGED',
  WORKER_DELETED = 'WORKER_DELETED',
  DELETED = 'DELETED',
}

export interface ProvisioningOperation {
  id: ProvisioningOperationId;
  tenantId: TenantId;
  step: ProvisioningStep;
  previousStep?: ProvisioningStep;
  error?: string;
  retriesRemaining: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}
