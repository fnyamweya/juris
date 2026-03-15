import { describe, it, expect } from 'vitest';
import {
  encryptPayload,
  decryptPayload,
  buildAadString,
  generateDek,
} from '../envelope-encryption.js';
import { importKekFromRaw } from '../key-management.js';
import { utf8Encode, utf8Decode } from '../encoding.js';

async function createTestKek(): Promise<CryptoKey> {
  const rawKey = crypto.getRandomValues(new Uint8Array(32));
  return importKekFromRaw(rawKey.buffer as ArrayBuffer);
}

describe('envelope encryption', () => {
  const aad = {
    tenantId: 'tenant-1',
    documentId: 'doc-123',
    version: 'v1',
    classification: 'CONFIDENTIAL',
  };

  it('encrypt then decrypt roundtrip succeeds', async () => {
    const kek = await createTestKek();
    const plaintext = utf8Encode('sensitive document content');

    const encrypted = await encryptPayload({
      plaintext: plaintext.buffer as ArrayBuffer,
      kek,
      kekVersion: 'kek-v1',
      aad,
    });

    const decrypted = await decryptPayload({
      encrypted,
      kek,
      aad,
    });

    expect(utf8Decode(decrypted)).toBe('sensitive document content');
  });

  it('decryption with wrong KEK fails', async () => {
    const kek1 = await createTestKek();
    const kek2 = await createTestKek();
    const plaintext = utf8Encode('secret data');

    const encrypted = await encryptPayload({
      plaintext: plaintext.buffer as ArrayBuffer,
      kek: kek1,
      kekVersion: 'kek-v1',
      aad,
    });

    await expect(
      decryptPayload({
        encrypted,
        kek: kek2,
        aad,
      }),
    ).rejects.toThrow();
  });

  it('decryption with tampered AAD fails', async () => {
    const kek = await createTestKek();
    const plaintext = utf8Encode('secret data');

    const encrypted = await encryptPayload({
      plaintext: plaintext.buffer as ArrayBuffer,
      kek,
      kekVersion: 'kek-v1',
      aad,
    });

    const tamperedAad = {
      ...aad,
      documentId: 'doc-456',
    };

    await expect(
      decryptPayload({
        encrypted,
        kek,
        aad: tamperedAad,
      }),
    ).rejects.toThrow();
  });

  it('decryption with tampered ciphertext fails', async () => {
    const kek = await createTestKek();
    const plaintext = utf8Encode('secret data');

    const encrypted = await encryptPayload({
      plaintext: plaintext.buffer as ArrayBuffer,
      kek,
      kekVersion: 'kek-v1',
      aad,
    });

    const tamperedCiphertext = new Uint8Array(encrypted.ciphertext.slice(0));
    tamperedCiphertext[0]! ^= 0xff;

    const tamperedEncrypted = {
      ...encrypted,
      ciphertext: tamperedCiphertext.buffer as ArrayBuffer,
    };

    await expect(
      decryptPayload({
        encrypted: tamperedEncrypted,
        kek,
        aad,
      }),
    ).rejects.toThrow();
  });

  it('IV is unique across encryptions', async () => {
    const kek = await createTestKek();
    const plaintext = utf8Encode('same content');

    const enc1 = await encryptPayload({
      plaintext: plaintext.buffer as ArrayBuffer,
      kek,
      kekVersion: 'kek-v1',
      aad,
    });

    const enc2 = await encryptPayload({
      plaintext: plaintext.buffer as ArrayBuffer,
      kek,
      kekVersion: 'kek-v1',
      aad,
    });

    expect(enc1.iv).not.toEqual(enc2.iv);
    expect(enc1.ciphertext).not.toEqual(enc2.ciphertext);
  });
});

describe('buildAadString', () => {
  it('produces deterministic concatenation', () => {
    const aad = {
      tenantId: 't1',
      documentId: 'd1',
      version: 'v1',
      classification: 'PUBLIC',
    };
    expect(buildAadString(aad)).toBe('t1|d1|v1|PUBLIC');
  });
});

describe('generateDek', () => {
  it('generates extractable AES-256-GCM key', async () => {
    const dek = await generateDek();
    expect(dek.type).toBe('secret');
    expect(dek.algorithm).toEqual({ name: 'AES-GCM', length: 256 });
  });
});
