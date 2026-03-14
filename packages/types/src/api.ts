export interface ApiResponse<T> {
  readonly data: T;
  readonly requestId: string;
}

export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly requestId: string;
    readonly details?: ReadonlyArray<{
      readonly field?: string;
      readonly message: string;
    }>;
  };
}

export interface PaginatedApiResponse<T> {
  readonly data: {
    readonly items: ReadonlyArray<T>;
    readonly cursor: string | null;
    readonly hasMore: boolean;
  };
  readonly requestId: string;
}
