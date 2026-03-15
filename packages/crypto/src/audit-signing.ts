import { sha256 } from './hashing.js';
import { utf8Encode } from './encoding.js';

export interface AuditChainSigner {
  sign(eventData: string, previousHash: string): Promise<{
    eventHash: string;
    signature: string;
  }>;
}

export function createAuditChainSigner(
  signingKey: CryptoKey,
  _signatureVersion: string
): AuditChainSigner {
  return {
    async sign(eventData: string, previousHash: string) {
      const eventHash = await sha256(previousHash + eventData);

      const dataToSign = utf8Encode(eventHash);
      const signature = await crypto.subtle.sign(
        'HMAC',
        signingKey,
        dataToSign
      );

      const signatureHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return { eventHash, signature: signatureHex };
    },
  };
}

export async function verifyAuditChainEntry(params: {
  eventData: string;
  previousHash: string;
  eventHash: string;
  signature: string;
  verificationKey: CryptoKey;
}): Promise<boolean> {
  const { eventData, previousHash, eventHash, signature, verificationKey } =
    params;

  const expectedHash = await sha256(previousHash + eventData);
  if (expectedHash !== eventHash) {
    return false;
  }

  const signatureBytes = new Uint8Array(signature.length / 2);
  for (let i = 0; i < signature.length; i += 2) {
    signatureBytes[i / 2] = parseInt(signature.slice(i, i + 2), 16);
  }

  const eventHashBytes = utf8Encode(eventHash);

  return crypto.subtle.verify(
    'HMAC',
    verificationKey,
    signatureBytes,
    eventHashBytes
  );
}
