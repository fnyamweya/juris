import type { ActorContext } from '@juris/domain';
import { createPrincipalId, createTenantId } from '@juris/domain';
import type { Logger } from '@juris/observability';
import { REQUEST_ID_HEADER, TRACE_ID_HEADER } from '@juris/observability';

import { AUTH_ERRORS } from './auth-errors.js';
import { PrincipalResolutionError } from './principal-resolver.js';
import type { PrincipalResolver, ResolvedPrincipal } from './principal-resolver.js';
import type { TokenVerifier, VerifiedToken } from './token-verifier.js';
import { TokenVerificationError } from './token-verifier.js';

export interface AuthGateResult {
  authenticated: true;
  actor: ActorContext;
}

export interface AuthGateErrorResult {
  authenticated: false;
  error: AuthGateError;
}

export type AuthGateResultType = AuthGateResult | AuthGateErrorResult;

export interface AuthGateError {
  code: string;
  message: string;
  status: number;
}

export interface TenantResolver {
  resolve(request: Request, token: VerifiedToken): Promise<{ tenantId: string } | null>;
}

export interface AuthGate {
  authenticate(request: Request): Promise<AuthGateResultType>;
}

export interface CreateAuthGateParams {
  tokenVerifier: TokenVerifier;
  tenantResolver: TenantResolver;
  principalResolver: PrincipalResolver;
  logger: Logger;
}

function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/\bCF_Authorization=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1] ?? '').trim();
    }
  }
  return null;
}

function toAuthGateError(code: string, message: string, status: number): AuthGateError {
  return { code, message, status };
}

export function createAuthGate(params: CreateAuthGateParams): AuthGate {
  const { tokenVerifier, tenantResolver, principalResolver, logger } = params;

  return {
    async authenticate(request: Request): Promise<AuthGateResultType> {
      const token = extractToken(request);
      if (!token) {
        const err = AUTH_ERRORS.MISSING_TOKEN;
        return {
          authenticated: false,
          error: toAuthGateError(err.code, err.message, err.status),
        };
      }

      let verifiedToken: VerifiedToken;
      try {
        verifiedToken = await tokenVerifier.verify(token);
      } catch (err) {
        if (err instanceof TokenVerificationError) {
          if (err.code === 'EXPIRED') {
            const e = AUTH_ERRORS.EXPIRED_TOKEN;
            return {
              authenticated: false,
              error: toAuthGateError(e.code, e.message, e.status),
            };
          }
          const e = AUTH_ERRORS.INVALID_TOKEN;
          logger.warn('Token verification failed', {
            code: err.code,
            message: err.message,
          });
          return {
            authenticated: false,
            error: toAuthGateError(e.code, e.message, e.status),
          };
        }
        logger.error('Token verification error', { err });
        const e = AUTH_ERRORS.INVALID_TOKEN;
        return {
          authenticated: false,
          error: toAuthGateError(e.code, e.message, e.status),
        };
      }

      const tenantResult = await tenantResolver.resolve(request, verifiedToken);
      if (!tenantResult) {
        const err = AUTH_ERRORS.TENANT_NOT_FOUND;
        return {
          authenticated: false,
          error: toAuthGateError(err.code, err.message, err.status),
        };
      }

      let resolved: ResolvedPrincipal;
      try {
        resolved = await principalResolver.resolve(verifiedToken, tenantResult.tenantId);
      } catch (err) {
        if (err instanceof PrincipalResolutionError) {
          if (err.code === 'NOT_FOUND') {
            const e = AUTH_ERRORS.PRINCIPAL_NOT_FOUND;
            return {
              authenticated: false,
              error: toAuthGateError(e.code, e.message, e.status),
            };
          }
          if (err.code === 'DEACTIVATED') {
            const e = AUTH_ERRORS.PRINCIPAL_DEACTIVATED;
            return {
              authenticated: false,
              error: toAuthGateError(e.code, e.message, e.status),
            };
          }
          if (err.code === 'TENANT_MISMATCH') {
            const e = AUTH_ERRORS.PRINCIPAL_NOT_FOUND;
            return {
              authenticated: false,
              error: toAuthGateError(e.code, e.message, e.status),
            };
          }
        }
        logger.error('Principal resolution failed', { err });
        const e = AUTH_ERRORS.PRINCIPAL_NOT_FOUND;
        return {
          authenticated: false,
          error: toAuthGateError(e.code, e.message, e.status),
        };
      }

      const principal = {
        id: createPrincipalId(resolved.principalId),
        tenantId: createTenantId(resolved.tenantId),
        type: resolved.principalType,
        email: resolved.email,
        displayName: resolved.displayName,
        status: 'ACTIVE',
        createdAt: new Date(),
      };

      const actor = {
        principal,
        tenantId: createTenantId(resolved.tenantId),
        requestId: request.headers.get(REQUEST_ID_HEADER) ?? undefined,
        traceId: request.headers.get(TRACE_ID_HEADER) ?? undefined,
      };

      return { authenticated: true, actor };
    },
  };
}
