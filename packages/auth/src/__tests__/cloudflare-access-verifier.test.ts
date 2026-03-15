import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCloudflareAccessVerifier } from '../cloudflare-access-verifier.js';
import { createInMemoryJwksCache } from '../jwks.js';
import type { Jwk } from '../jwks.js';

const TEAM_DOMAIN = 'test-team';
const AUD = 'test-audience';
const JWKS_URL = `https://${TEAM_DOMAIN}.cloudflareaccess.com/cdn-cgi/access/certs`;
const EXPECTED_ISS = `https://${TEAM_DOMAIN}.cloudflareaccess.com/cdn-cgi/access`;

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createTestKeyPair(): Promise<{
  keyPair: CryptoKeyPair;
  publicJwk: Jwk;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  ) as CryptoKeyPair;

  const publicKey = await crypto.subtle.exportKey(
    'jwk',
    keyPair.publicKey
  ) as JsonWebKey;

  const publicJwk: Jwk = {
    kty: publicKey.kty as string,
    n: publicKey.n as string,
    e: publicKey.e as string,
    kid: 'test-kid',
    alg: 'RS256',
    use: 'sig',
  };

  return { keyPair, publicJwk };
}

async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKey: CryptoKey
): Promise<string> {
  const headerB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput)
  );
  const sigB64 = base64UrlEncode(new Uint8Array(signature));
  return `${signingInput}.${sigB64}`;
}

describe('createCloudflareAccessVerifier', () => {
  let keyPair: CryptoKeyPair;
  let publicJwk: Jwk;

  beforeEach(async () => {
    const result = await createTestKeyPair();
    keyPair = result.keyPair;
    publicJwk = result.publicJwk;
  });

  it('verify succeeds with valid token', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
      iss: EXPECTED_ISS,
      aud: AUD,
      iat: now - 60,
      exp: now + 3600,
    };
    const header = { alg: 'RS256', kid: 'test-kid' };
    const token = await signJwt(
      header,
      payload,
      keyPair.privateKey
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ keys: [publicJwk] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const cache = createInMemoryJwksCache();
    const verifier = createCloudflareAccessVerifier({
      teamDomain: TEAM_DOMAIN,
      aud: AUD,
      jwksCache: cache,
    });

    const result = await verifier.verify(token);

    expect(result.sub).toBe('user-123');
    expect(result.email).toBe('user@example.com');
    expect(result.iss).toBe(EXPECTED_ISS);
    expect(result.aud).toBe(AUD);
    expect(result.iat).toBe(payload.iat);
    expect(result.exp).toBe(payload.exp);

    expect(fetchMock).toHaveBeenCalledWith(JWKS_URL);
    vi.unstubAllGlobals();
  });

  it('verify rejects expired token', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
      iss: EXPECTED_ISS,
      aud: AUD,
      iat: now - 7200,
      exp: now - 3600,
    };
    const header = { alg: 'RS256', kid: 'test-kid' };
    const token = await signJwt(
      header,
      payload,
      keyPair.privateKey
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ keys: [publicJwk] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const verifier = createCloudflareAccessVerifier({
      teamDomain: TEAM_DOMAIN,
      aud: AUD,
    });

    await expect(verifier.verify(token)).rejects.toMatchObject({
      name: 'TokenVerificationError',
      code: 'EXPIRED',
    });

    vi.unstubAllGlobals();
  });

  it('verify rejects wrong audience', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
      iss: EXPECTED_ISS,
      aud: 'wrong-audience',
      iat: now - 60,
      exp: now + 3600,
    };
    const header = { alg: 'RS256', kid: 'test-kid' };
    const token = await signJwt(
      header,
      payload,
      keyPair.privateKey
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ keys: [publicJwk] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const verifier = createCloudflareAccessVerifier({
      teamDomain: TEAM_DOMAIN,
      aud: AUD,
    });

    await expect(verifier.verify(token)).rejects.toMatchObject({
      name: 'TokenVerificationError',
      code: 'INVALID_AUDIENCE',
    });

    vi.unstubAllGlobals();
  });

  it('verify rejects malformed token', async () => {
    const verifier = createCloudflareAccessVerifier({
      teamDomain: TEAM_DOMAIN,
      aud: AUD,
    });

    await expect(verifier.verify('not.a.jwt')).rejects.toMatchObject({
      name: 'TokenVerificationError',
      code: 'MALFORMED',
    });

    await expect(verifier.verify('onlytwoparts.here')).rejects.toMatchObject({
      name: 'TokenVerificationError',
      code: 'MALFORMED',
    });

    await expect(verifier.verify('!!!.!!!.!!!')).rejects.toMatchObject({
      name: 'TokenVerificationError',
      code: 'MALFORMED',
    });
  });

  it('JWKS cache is used on second call', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'user-123',
      email: 'user@example.com',
      iss: EXPECTED_ISS,
      aud: AUD,
      iat: now - 60,
      exp: now + 3600,
    };
    const header = { alg: 'RS256', kid: 'test-kid' };
    const token = await signJwt(
      header,
      payload,
      keyPair.privateKey
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ keys: [publicJwk] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const cache = createInMemoryJwksCache(60_000);
    const verifier = createCloudflareAccessVerifier({
      teamDomain: TEAM_DOMAIN,
      aud: AUD,
      jwksCache: cache,
    });

    await verifier.verify(token);
    await verifier.verify(token);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });
});
