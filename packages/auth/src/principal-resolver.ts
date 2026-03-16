import type { PrincipalType } from '@jusris/domain';

import type { VerifiedToken } from './token-verifier.js';

export interface ResolvedPrincipal {
  principalId: string;
  tenantId: string;
  principalType: PrincipalType;
  email: string;
  displayName?: string;
  roles: string[];
}

export type PrincipalResolutionErrorCode =
  | 'NOT_FOUND'
  | 'TENANT_MISMATCH'
  | 'DEACTIVATED'
  | 'LOOKUP_FAILED';

export class PrincipalResolutionError extends Error {
  readonly code: PrincipalResolutionErrorCode;

  constructor(message: string, options: { cause?: unknown; code: PrincipalResolutionErrorCode }) {
    super(message, { cause: options.cause });
    this.name = 'PrincipalResolutionError';
    this.code = options.code;
    Object.setPrototypeOf(this, PrincipalResolutionError.prototype);
  }
}

export interface PrincipalResolver {
  resolve(token: VerifiedToken, tenantId: string): Promise<ResolvedPrincipal>;
}
