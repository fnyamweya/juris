import type { JwksCache } from './jwks.js';
import {
  fetchJwks,
  jwkToCryptoKey,
  createInMemoryJwksCache,
  base64UrlDecode,
} from './jwks.js';
import type { TokenVerifier, VerifiedToken } from './token-verifier.js';
import { TokenVerificationError } from './token-verifier.js';

export interface CreateCloudflareAccessVerifierParams {
  teamDomain: string;
  aud: string;
  jwksCache?: JwksCache;
}

function getJwksUrl(teamDomain: string): string {
  return `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/certs`;
}

function parseJwtPayload(token: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signingInput: string;
  signature: ArrayBuffer;
} {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new TokenVerificationError('Malformed JWT', { code: 'MALFORMED' });
  }

  const headerB64 = parts[0];
  const payloadB64 = parts[1];
  const sigB64 = parts[2];
  if (
    headerB64 === undefined ||
    payloadB64 === undefined ||
    sigB64 === undefined
  ) {
    throw new TokenVerificationError('Malformed JWT', { code: 'MALFORMED' });
  }

  const signingInput = `${headerB64}.${payloadB64}`;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    const headerJson = new TextDecoder().decode(base64UrlDecode(headerB64));
    header = JSON.parse(headerJson) as Record<string, unknown>;
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    payload = JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    throw new TokenVerificationError('Malformed JWT', { code: 'MALFORMED' });
  }

  const signature = base64UrlDecode(sigB64);
  return { header, payload, signingInput, signature };
}

function getKid(header: Record<string, unknown>): string | undefined {
  const kid = header.kid;
  return typeof kid === 'string' ? kid : undefined;
}

function validatePayload(
  payload: Record<string, unknown>,
  expectedAud: string,
  teamDomain: string
): VerifiedToken {
  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp;
  const iat = payload.iat;
  const sub = payload.sub;
  const email = payload.email;
  const iss = payload.iss;
  const aud = payload.aud;

  if (typeof exp !== 'number') {
    throw new TokenVerificationError('Missing exp claim', { code: 'MALFORMED' });
  }
  if (exp < now) {
    throw new TokenVerificationError('Token expired', { code: 'EXPIRED' });
  }
  if (typeof iat !== 'number') {
    throw new TokenVerificationError('Missing iat claim', { code: 'MALFORMED' });
  }
  if (iat > now) {
    throw new TokenVerificationError('Invalid iat claim', { code: 'MALFORMED' });
  }

  const expectedIss = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access`;
  if (typeof iss !== 'string' || iss !== expectedIss) {
    throw new TokenVerificationError('Invalid issuer', {
      code: 'INVALID_ISSUER',
    });
  }

  const audList = Array.isArray(aud) ? aud : typeof aud === 'string' ? [aud] : [];
  if (!audList.includes(expectedAud)) {
    throw new TokenVerificationError('Invalid audience', {
      code: 'INVALID_AUDIENCE',
    });
  }

  if (typeof sub !== 'string') {
    throw new TokenVerificationError('Missing sub claim', { code: 'MALFORMED' });
  }
  if (typeof email !== 'string') {
    throw new TokenVerificationError('Missing email claim', {
      code: 'MALFORMED',
    });
  }

  const claims: Record<string, unknown> = { ...payload };
  return {
    sub,
    email,
    iss,
    aud: payload.aud as string | string[],
    iat,
    exp,
    claims,
  };
}

export function createCloudflareAccessVerifier(
  params: CreateCloudflareAccessVerifierParams
): TokenVerifier {
  const {
    teamDomain,
    aud,
    jwksCache = createInMemoryJwksCache(5 * 60 * 1000),
  } = params;

  const jwksUrl = getJwksUrl(teamDomain);

  return {
    async verify(token: string): Promise<VerifiedToken> {
      if (!token || typeof token !== 'string') {
        throw new TokenVerificationError('Missing token', { code: 'MISSING' });
      }

      const trimmed = token.trim();
      if (!trimmed) {
        throw new TokenVerificationError('Missing token', { code: 'MISSING' });
      }

      let parsed: ReturnType<typeof parseJwtPayload>;
      try {
        parsed = parseJwtPayload(trimmed);
      } catch (err) {
        if (err instanceof TokenVerificationError) throw err;
        throw new TokenVerificationError('Malformed JWT', {
          code: 'MALFORMED',
          cause: err,
        });
      }

      const { header, payload, signingInput, signature } = parsed;
      const kid = getKid(header);

      let keys = await jwksCache.get(jwksUrl);
      if (!keys) {
        keys = await fetchJwks(jwksUrl);
        jwksCache.set(jwksUrl, keys);
      }

      const jwk = kid
        ? keys.find((k) => k.kid === kid)
        : keys[0];
      if (!jwk) {
        throw new TokenVerificationError('No matching key found', {
          code: 'INVALID_SIGNATURE',
        });
      }

      const cryptoKey = await jwkToCryptoKey(jwk);
      const signingInputBytes = new TextEncoder().encode(signingInput);

      const valid = await crypto.subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        cryptoKey,
        signature,
        signingInputBytes
      );

      if (!valid) {
        throw new TokenVerificationError('Invalid signature', {
          code: 'INVALID_SIGNATURE',
        });
      }

      return validatePayload(payload, aud, teamDomain);
    },
  };
}
