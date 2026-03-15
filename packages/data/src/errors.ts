export type DataAccessErrorCode =
  | 'QUERY_FAILED'
  | 'NOT_FOUND'
  | 'CONSTRAINT_VIOLATION'
  | 'TRANSACTION_FAILED'
  | 'CONNECTION_FAILED';

export class DataAccessError extends Error {
  readonly code: DataAccessErrorCode;

  constructor(message: string, code: DataAccessErrorCode = 'QUERY_FAILED', cause?: unknown) {
    super(message);
    this.name = 'DataAccessError';
    this.code = code;
    if (cause !== undefined) {
      this.cause = cause;
    }
    Object.setPrototypeOf(this, DataAccessError.prototype);
  }
}
