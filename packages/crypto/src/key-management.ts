export interface KeyEnvelope {
  wrappedKey: ArrayBuffer;
  wrapperKeyVersion: string;
  algorithm: string;
}

export interface KeyProvider {
  getKek(tenantId: string, version?: string): Promise<CryptoKey>;
  getCurrentKekVersion(tenantId: string): Promise<string>;
  rotateKek(tenantId: string): Promise<{ newVersion: string }>;
}

export async function importKekFromRaw(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  );
}
