import { describe, it, expect, vi } from 'vitest';
import { createPolicyEvaluator } from '../policy-evaluator.js';
import type { RoleBindingLoader, EffectiveBinding } from '../role-binding-loader.js';
import type { PolicyLoader } from '../policy-loader.js';
import type { AccessRequest } from '@jusris/domain';
import {
  Permission,
  PrincipalType,
  createPrincipalId,
  createTenantId,
} from '@jusris/domain';

const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

function createActor(principalType: PrincipalType = PrincipalType.INTERNAL_USER): AccessRequest['actor'] {
  return {
    principal: {
      id: createPrincipalId('user-1'),
      tenantId: createTenantId('tenant-1'),
      type: principalType,
      status: 'ACTIVE',
      createdAt: new Date(),
    },
    tenantId: createTenantId('tenant-1'),
  };
}

function createRequest(overrides: Partial<AccessRequest> = {}): AccessRequest {
  return {
    actor: createActor(),
    action: Permission.VIEW,
    resourceType: 'matter',
    resourceId: 'matter-1',
    matterId: 'matter-1',
    ...overrides,
  };
}

describe('PolicyEvaluator', () => {
  it('default deny when no bindings exist', async () => {
    const roleBindingLoader: RoleBindingLoader = {
      loadBindings: vi.fn().mockResolvedValue([]),
    };
    const policyLoader: PolicyLoader = {
      loadPolicies: vi.fn().mockResolvedValue([]),
    };
    const evaluator = createPolicyEvaluator({
      roleBindingLoader,
      policyLoader,
      logger: mockLogger,
    });

    const decision = await evaluator.evaluate(createRequest());

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('No matching role binding');
    expect(roleBindingLoader.loadBindings).toHaveBeenCalledWith('user-1', 'tenant-1');
  });

  it('allow when tenant-scoped admin role grants permission', async () => {
    const tenantAdminBinding: EffectiveBinding = {
      roleId: 'role-admin',
      roleName: 'TenantAdmin',
      permissions: [Permission.ADMIN, Permission.VIEW, Permission.EDIT],
      scope: 'TENANT',
      scopeId: 'tenant-1',
    };
    const roleBindingLoader: RoleBindingLoader = {
      loadBindings: vi.fn().mockResolvedValue([tenantAdminBinding]),
    };
    const policyLoader: PolicyLoader = {
      loadPolicies: vi.fn().mockResolvedValue([]),
    };
    const evaluator = createPolicyEvaluator({
      roleBindingLoader,
      policyLoader,
      logger: mockLogger,
    });

    const decision = await evaluator.evaluate(createRequest());

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toContain('TenantAdmin');
    expect(decision.reason).toContain('TENANT');
  });

  it('allow when matter-scoped role grants view', async () => {
    const matterBinding: EffectiveBinding = {
      roleId: 'role-counsel',
      roleName: 'Counsel',
      permissions: [Permission.VIEW, Permission.EDIT],
      scope: 'MATTER',
      scopeId: 'matter-1',
    };
    const roleBindingLoader: RoleBindingLoader = {
      loadBindings: vi.fn().mockResolvedValue([matterBinding]),
    };
    const policyLoader: PolicyLoader = {
      loadPolicies: vi.fn().mockResolvedValue([]),
    };
    const evaluator = createPolicyEvaluator({
      roleBindingLoader,
      policyLoader,
      logger: mockLogger,
    });

    const decision = await evaluator.evaluate(createRequest());

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toContain('Counsel');
    expect(decision.reason).toContain('MATTER');
  });

  it('deny when actor has role but wrong scope', async () => {
    const matterBinding: EffectiveBinding = {
      roleId: 'role-counsel',
      roleName: 'Counsel',
      permissions: [Permission.VIEW],
      scope: 'MATTER',
      scopeId: 'matter-other',
    };
    const roleBindingLoader: RoleBindingLoader = {
      loadBindings: vi.fn().mockResolvedValue([matterBinding]),
    };
    const policyLoader: PolicyLoader = {
      loadPolicies: vi.fn().mockResolvedValue([]),
    };
    const evaluator = createPolicyEvaluator({
      roleBindingLoader,
      policyLoader,
      logger: mockLogger,
    });

    const decision = await evaluator.evaluate(createRequest());

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('No matching role binding');
  });

  it('deny for external client trying to access unshared document', async () => {
    const tenantBinding: EffectiveBinding = {
      roleId: 'role-client',
      roleName: 'ExternalClient',
      permissions: [Permission.VIEW],
      scope: 'TENANT',
      scopeId: 'tenant-1',
    };
    const roleBindingLoader: RoleBindingLoader = {
      loadBindings: vi.fn().mockResolvedValue([tenantBinding]),
    };
    const policyLoader: PolicyLoader = {
      loadPolicies: vi.fn().mockResolvedValue([
        {
          id: 'deny-external-doc',
          effect: 'DENY',
          actorTypes: [PrincipalType.EXTERNAL_CLIENT],
          actions: [Permission.VIEW],
          resourceTypes: ['document'],
        },
      ]),
    };
    const evaluator = createPolicyEvaluator({
      roleBindingLoader,
      policyLoader,
      logger: mockLogger,
    });

    const decision = await evaluator.evaluate(
      createRequest({
        actor: createActor(PrincipalType.EXTERNAL_CLIENT),
        resourceType: 'document',
        resourceId: 'doc-1',
      })
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('Denied by policy rule');
  });

  it('multiple bindings: most specific scope wins', async () => {
    const tenantBinding: EffectiveBinding = {
      roleId: 'role-tenant',
      roleName: 'TenantViewer',
      permissions: [Permission.VIEW],
      scope: 'TENANT',
      scopeId: 'tenant-1',
    };
    const matterBinding: EffectiveBinding = {
      roleId: 'role-matter',
      roleName: 'MatterLead',
      permissions: [Permission.VIEW, Permission.EDIT],
      scope: 'MATTER',
      scopeId: 'matter-1',
    };
    const documentBinding: EffectiveBinding = {
      roleId: 'role-doc',
      roleName: 'DocumentOwner',
      permissions: [Permission.VIEW, Permission.EDIT, Permission.DELETE],
      scope: 'DOCUMENT',
      scopeId: 'doc-1',
    };
    const roleBindingLoader: RoleBindingLoader = {
      loadBindings: vi.fn().mockResolvedValue([
        tenantBinding,
        matterBinding,
        documentBinding,
      ]),
    };
    const policyLoader: PolicyLoader = {
      loadPolicies: vi.fn().mockResolvedValue([]),
    };
    const evaluator = createPolicyEvaluator({
      roleBindingLoader,
      policyLoader,
      logger: mockLogger,
    });

    const docDecision = await evaluator.evaluate(
      createRequest({
        resourceType: 'document',
        resourceId: 'doc-1',
        matterId: 'matter-1',
      })
    );
    expect(docDecision.allowed).toBe(true);
    expect(docDecision.reason).toContain('DocumentOwner');
    expect(docDecision.reason).toContain('DOCUMENT');

    const matterDecision = await evaluator.evaluate(
      createRequest({
        resourceType: 'matter',
        resourceId: 'matter-1',
        matterId: 'matter-1',
      })
    );
    expect(matterDecision.allowed).toBe(true);
    expect(matterDecision.reason).toContain('MatterLead');
    expect(matterDecision.reason).toContain('MATTER');
  });
});
