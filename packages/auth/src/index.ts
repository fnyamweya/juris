export { AUTH_ERRORS } from './auth-errors.js';

export { createAuthGate } from './auth-middleware.js';
export type {
  AuthGate,
  AuthGateResult,
  AuthGateError,
  AuthGateErrorResult,
  AuthGateResultType,
  TenantResolver,
  CreateAuthGateParams,
} from './auth-middleware.js';

export { createCloudflareAccessVerifier } from './cloudflare-access-verifier.js';
export type { CreateCloudflareAccessVerifierParams } from './cloudflare-access-verifier.js';

export { createInMemoryJwksCache, fetchJwks, jwkToCryptoKey, base64UrlDecode } from './jwks.js';
export type { Jwk, JwksCache } from './jwks.js';

export type { PrincipalResolver, ResolvedPrincipal } from './principal-resolver.js';
export { PrincipalResolutionError } from './principal-resolver.js';

export type { TokenVerifier, VerifiedToken, TokenVerificationErrorCode } from './token-verifier.js';
export { TokenVerificationError } from './token-verifier.js';
