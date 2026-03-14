export interface ListQuery {
  cursor?: string;
  limit: number;
  filters?: Record<string, unknown>;
  sort?: { field: string; direction: 'asc' | 'desc' };
}

export interface PaginatedResult<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
}

export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findMany(query: ListQuery): Promise<PaginatedResult<T>>;
  create(entity: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}
