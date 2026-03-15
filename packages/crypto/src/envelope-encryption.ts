import { utf8Encode } from './encoding.js';

export interface AdditionalAuthData {
  tenantId: string;
  documentId: string;
  version: string;
  classification: string;
}

export interface EncryptedPayload {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  wrappedDek: ArrayBuffer;
  algorithm: 'AES-256-GCM';
  kekVersion: string;
  aad: string;
}

const AES_GCM_IV_LENGTH = 12;
const AES_GCM_TAG_LENGTH = 128;

export function buildAadString(aad: AdditionalAuthData): string {
  return `${aad.tenantId}|${aad.documentId}|${aad.version}|${aad.classification}`;
}

export async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  ) as Promise<CryptoKey>;
}

export async function encryptPayload(params: {
  plaintext: ArrayBuffer;
  kek: CryptoKey;
  kekVersion: string;
  aad: AdditionalAuthData;
}): Promise<EncryptedPayload> {
  const { plaintext, kek, kekVersion, aad } = params;

  const dek = await generateDek();
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH));
  const aadString = buildAadString(aad);
  const aadBytes = utf8Encode(aadString);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: aadBytes,
      tagLength: AES_GCM_TAG_LENGTH,
    },
    dek,
    plaintext
  );

  const wrappedDek = await crypto.subtle.wrapKey(
    'raw',
    dek,
    kek,
    { name: 'AES-KW' }
  );

  return {
    ciphertext,
    iv,
    wrappedDek,
    algorithm: 'AES-256-GCM',
    kekVersion,
    aad: aadString,
  };
}

export async function decryptPayload(params: {
  encrypted: EncryptedPayload;
  kek: CryptoKey;
  aad: AdditionalAuthData;
}): Promise<ArrayBuffer> {
  const { encrypted, kek, aad } = params;

  const dek = await crypto.subtle.unwrapKey(
    'raw',
    encrypted.wrappedDek,
    kek,
    { name: 'AES-KW' },
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const aadString = buildAadString(aad);
  const aadBytes = utf8Encode(aadString);

  return crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: encrypted.iv,
      additionalData: aadBytes,
      tagLength: AES_GCM_TAG_LENGTH,
    },
    dek,
    encrypted.ciphertext
  );
}
