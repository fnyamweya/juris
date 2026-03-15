import { describe, it, expect } from 'vitest';
import { createAuditChainSigner, verifyAuditChainEntry } from '../audit-signing.js';

async function createTestSigningKey(): Promise<CryptoKey> {
  const rawKey = crypto.getRandomValues(new Uint8Array(32));
  return crypto.subtle.importKey('raw', rawKey, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

describe('audit chain signing', () => {
  it('sign and verify roundtrip', async () => {
    const key = await createTestSigningKey();
    const signer = createAuditChainSigner(key, 'v1');
    const genesisHash = '0'.repeat(64);

    const { eventHash, signature } = await signer.sign(
      '{"action":"create","entity":"document"}',
      genesisHash,
    );

    const valid = await verifyAuditChainEntry({
      eventData: '{"action":"create","entity":"document"}',
      previousHash: genesisHash,
      eventHash,
      signature,
      verificationKey: key,
    });

    expect(valid).toBe(true);
  });

  it('chain integrity: sign event1, chain event2 to event1 hash, verify both', async () => {
    const key = await createTestSigningKey();
    const signer = createAuditChainSigner(key, 'v1');
    const genesisHash = '0'.repeat(64);

    const event1 = '{"action":"create","id":"doc-1"}';
    const { eventHash: hash1, signature: sig1 } = await signer.sign(event1, genesisHash);

    const event2 = '{"action":"update","id":"doc-1"}';
    const { eventHash: hash2, signature: sig2 } = await signer.sign(event2, hash1);

    const valid1 = await verifyAuditChainEntry({
      eventData: event1,
      previousHash: genesisHash,
      eventHash: hash1,
      signature: sig1,
      verificationKey: key,
    });
    expect(valid1).toBe(true);

    const valid2 = await verifyAuditChainEntry({
      eventData: event2,
      previousHash: hash1,
      eventHash: hash2,
      signature: sig2,
      verificationKey: key,
    });
    expect(valid2).toBe(true);
  });

  it('verification fails with tampered data', async () => {
    const key = await createTestSigningKey();
    const signer = createAuditChainSigner(key, 'v1');
    const genesisHash = '0'.repeat(64);

    const { eventHash, signature } = await signer.sign('{"action":"create"}', genesisHash);

    const valid = await verifyAuditChainEntry({
      eventData: '{"action":"create","tampered":true}',
      previousHash: genesisHash,
      eventHash,
      signature,
      verificationKey: key,
    });

    expect(valid).toBe(false);
  });

  it('verification fails with wrong key', async () => {
    const key1 = await createTestSigningKey();
    const key2 = await createTestSigningKey();
    const signer = createAuditChainSigner(key1, 'v1');
    const genesisHash = '0'.repeat(64);

    const { eventHash, signature } = await signer.sign('{"action":"create"}', genesisHash);

    const valid = await verifyAuditChainEntry({
      eventData: '{"action":"create"}',
      previousHash: genesisHash,
      eventHash,
      signature,
      verificationKey: key2,
    });

    expect(valid).toBe(false);
  });
});
