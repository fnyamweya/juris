export interface Jwk {
  kty: string;
  n?: string;
  e?: string;
  kid?: string;
  alg?: string;
  use?: string;
  [key: string]: unknown;
}

export interface JwksCache {
  get(url: string): Promise<Jwk[] | null>;
  set(url: string, keys: Jwk[]): void;
}

export function base64UrlDecode(input: string): ArrayBuffer {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function createInMemoryJwksCache(ttlMs = 5 * 60 * 1000): JwksCache {
  const cache = new Map<string, { keys: Jwk[]; expiresAt: number }>();

  return {
    async get(url: string): Promise<Jwk[] | null> {
      const entry = cache.get(url);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        cache.delete(url);
        return null;
      }
      return entry.keys;
    },
    set(url: string, keys: Jwk[]): void {
      cache.set(url, { keys, expiresAt: Date.now() + ttlMs });
    },
  };
}

export async function fetchJwks(url: string): Promise<Jwk[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS from ${url}: ${res.status}`);
  }
  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = body.keys;
  if (!Array.isArray(keys)) {
    throw new Error(`Invalid JWKS response from ${url}: missing keys array`);
  }
  return keys;
}

export async function jwkToCryptoKey(jwk: Jwk): Promise<CryptoKey> {
  if (jwk.kty !== 'RSA') {
    throw new Error(`Unsupported JWK kty: ${jwk.kty}`);
  }
  if (!jwk.n || !jwk.e) {
    throw new Error('RSA JWK must have n and e');
  }

  const keyData: JsonWebKey = {
    kty: 'RSA',
    n: jwk.n,
    e: jwk.e,
    alg: jwk.alg ?? 'RS256',
    use: jwk.use ?? 'sig',
  };
  if (jwk.kid) (keyData as unknown as Record<string, unknown>)['kid'] = jwk.kid;

  return crypto.subtle.importKey(
    'jwk',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
}
