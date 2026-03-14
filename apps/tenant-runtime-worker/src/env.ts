export interface TenantRuntimeWorkerEnv {
  readonly TENANT_DB: D1Database;
  readonly TENANT_STORAGE: R2Bucket;
  readonly TENANT_VECTOR_INDEX: VectorizeIndex;
  readonly AI: Ai;
  readonly ENVIRONMENT: string;
  readonly LOG_LEVEL: string;
}
