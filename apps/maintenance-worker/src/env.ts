export interface MaintenanceWorkerEnv {
  readonly MASTER_REGISTRY_DB: D1Database;
  readonly ENVIRONMENT: string;
  readonly LOG_LEVEL: string;
}
