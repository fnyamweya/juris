import type { AccessRequest, AccessDecision } from '@juris/domain';
import type { Logger } from '@juris/observability';

import type { PolicyLoader } from './policy-loader.js';
import type { RoleBindingLoader, EffectiveBinding } from './role-binding-loader.js';

export interface PolicyEvaluator {
  evaluate(request: AccessRequest): Promise<AccessDecision>;
}

export interface CreatePolicyEvaluatorParams {
  roleBindingLoader: RoleBindingLoader;
  policyLoader: PolicyLoader;
  logger: Logger;
}

const POLICY_VERSION = '1.0';

export function createPolicyEvaluator(params: CreatePolicyEvaluatorParams): PolicyEvaluator {
  const { roleBindingLoader, policyLoader, logger } = params;

  return {
    async evaluate(request: AccessRequest): Promise<AccessDecision> {
      const { actor, action, resourceType, resourceId } = request;
      const principalId = actor.principal.id as string;
      const tenantId = actor.tenantId as string;

      const bindings = await roleBindingLoader.loadBindings(principalId, tenantId);
      const policies = await policyLoader.loadPolicies(tenantId);

      for (const rule of policies) {
        if (rule.effect === 'DENY' && matchesRule(rule, request, actor)) {
          const reason = `Denied by policy rule ${rule.id}`;
          logger.info('Access denied', {
            actorId: principalId,
            action,
            resourceType,
            resourceId,
            reason,
          });
          return { allowed: false, reason, policyVersion: POLICY_VERSION };
        }
      }

      const matchingBinding = findMatchingBinding(bindings, request);
      if (matchingBinding) {
        const reason = `Allowed by role ${matchingBinding.roleName} (${matchingBinding.scope}:${matchingBinding.scopeId})`;
        logger.info('Access allowed', {
          actorId: principalId,
          action,
          resourceType,
          resourceId,
          reason,
        });
        return { allowed: true, reason, policyVersion: POLICY_VERSION };
      }

      const reason = 'No matching role binding grants permission';
      logger.info('Access denied', {
        actorId: principalId,
        action,
        resourceType,
        resourceId,
        reason,
      });
      return { allowed: false, reason, policyVersion: POLICY_VERSION };
    },
  };
}

function matchesRule(
  rule: { actorTypes: unknown[]; actions: unknown[]; resourceTypes: string[] },
  request: AccessRequest,
  actor: AccessRequest['actor'],
): boolean {
  const actorTypeMatch = rule.actorTypes.includes(actor.principal.type);
  const actionMatch = rule.actions.includes(request.action);
  const resourceMatch = rule.resourceTypes.includes(request.resourceType);
  return actorTypeMatch && actionMatch && resourceMatch;
}

function findMatchingBinding(
  bindings: EffectiveBinding[],
  request: AccessRequest,
): EffectiveBinding | null {
  const { action } = request;

  const scopeOrder: Record<string, number> = {
    DOCUMENT: 3,
    MATTER: 2,
    TENANT: 1,
  };

  let bestMatch: EffectiveBinding | null = null;
  let bestScopeScore = 0;

  for (const binding of bindings) {
    if (!binding.permissions.includes(action)) continue;

    const scopeScore = scopeOrder[binding.scope] ?? 0;
    if (scopeScore <= bestScopeScore) continue;

    const scopeMatches = matchesScope(binding, request);
    if (scopeMatches) {
      bestMatch = binding;
      bestScopeScore = scopeScore;
    }
  }

  return bestMatch;
}

function matchesScope(binding: EffectiveBinding, request: AccessRequest): boolean {
  const { resourceId, matterId } = request;
  const tenantId = request.actor.tenantId as string;

  switch (binding.scope) {
    case 'TENANT':
      return binding.scopeId === tenantId;
    case 'MATTER':
      return matterId ? binding.scopeId === matterId : false;
    case 'DOCUMENT':
      return binding.scopeId === resourceId;
    default:
      return false;
  }
}
