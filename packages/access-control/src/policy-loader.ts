import type { Permission, PrincipalType } from '@jusris/domain';

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'not_in' | 'exists';
  value: unknown;
}

export interface PolicyRule {
  id: string;
  effect: 'ALLOW' | 'DENY';
  actorTypes: PrincipalType[];
  actions: Permission[];
  resourceTypes: string[];
  conditions?: PolicyCondition[];
}

export interface VersionedPolicyBundle {
  tenantId: string;
  version: string;
  rules: PolicyRule[];
  loadedAt: number;
}

export interface PolicyLoader {
  loadPolicies(tenantId: string): Promise<PolicyRule[]>;
}
