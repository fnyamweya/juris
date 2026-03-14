export interface VerifiedToken {
  sub: string;
  email: string;
  iss: string;
  aud: string | string[];
  iat: number;
  exp: number;
  claims: Record<string, unknown>;
}

export type TokenVerificationErrorCode =
  | 'EXPIRED'
  | 'INVALID_SIGNATURE'
  | 'INVALID_AUDIENCE'
  | 'INVALID_ISSUER'
  | 'MALFORMED'
  | 'MISSING';

export class TokenVerificationError extends Error {
  readonly code: TokenVerificationErrorCode;

  constructor(
    message: string,
    options: { cause?: unknown; code: TokenVerificationErrorCode }
  ) {
    super(message, { cause: options.cause });
    this.name = 'TokenVerificationError';
    this.code = options.code;
    Object.setPrototypeOf(this, TokenVerificationError.prototype);
  }
}

export interface TokenVerifier {
  verify(token: string): Promise<VerifiedToken>;
}
