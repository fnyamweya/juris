import type { Permission } from '@juris/domain';

export type BindingScope = 'TENANT' | 'MATTER' | 'DOCUMENT';

export interface EffectiveBinding {
  roleId: string;
  roleName: string;
  permissions: Permission[];
  scope: BindingScope;
  scopeId: string;
}

export interface RoleBindingLoader {
  loadBindings(principalId: string, tenantId: string): Promise<EffectiveBinding[]>;
}
