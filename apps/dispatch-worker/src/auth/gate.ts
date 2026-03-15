import {
  createCloudflareAccessVerifier,
  createAuthGate,
  type AuthGate,
  type TenantResolver,
} from '@jusris/auth';
import { PrincipalType } from '@jusris/domain';
import type { Logger } from '@jusris/observability';
import type { DispatchWorkerEnv } from '../env.js';

function createDispatchTenantResolver(env: DispatchWorkerEnv): TenantResolver {
  return {
    async resolve(request, token) {
      const hostname = new URL(request.url).hostname;
      const route = await env.MASTER_REGISTRY_DB.prepare(
        'SELECT tenant_id FROM hostname_routes WHERE hostname = ? AND is_active = 1',
      )
        .bind(hostname)
        .first<{ tenant_id: string }>();
      if (route) return { tenantId: route.tenant_id };

      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const slug = parts[0];
        const tenant = await env.MASTER_REGISTRY_DB.prepare(
          'SELECT id FROM tenants WHERE slug = ? AND status = ?',
        )
          .bind(slug, 'ACTIVE')
          .first<{ id: string }>();
        if (tenant) return { tenantId: tenant.id };
      }

      const tenantClaim = token.claims['custom:tenant_id'];
      if (typeof tenantClaim === 'string' && tenantClaim.length > 0) {
        return { tenantId: tenantClaim };
      }

      return null;
    },
  };
}

function createDispatchPrincipalResolver() {
  return {
    async resolve(token: { sub: string; email?: string }, tenantId: string) {
      return {
        principalId: token.sub,
        tenantId,
        principalType: PrincipalType.INTERNAL_USER,
        email: token.email ?? '',
        displayName: token.email ?? token.sub,
        roles: [],
      };
    },
  };
}

export function createAuthGateForDispatch(env: DispatchWorkerEnv, logger: Logger): AuthGate {
  const tokenVerifier = createCloudflareAccessVerifier({
    teamDomain: env.CF_ACCESS_TEAM_DOMAIN,
    aud: env.CF_ACCESS_AUD,
  });

  const tenantResolver = createDispatchTenantResolver(env);
  const principalResolver = createDispatchPrincipalResolver();

  return createAuthGate({ tokenVerifier, tenantResolver, principalResolver, logger });
}
