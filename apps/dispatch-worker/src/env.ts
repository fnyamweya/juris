export interface DispatchWorkerEnv {
  readonly MASTER_REGISTRY_DB: D1Database;
  readonly CF_ACCESS_TEAM_DOMAIN: string;
  readonly CF_ACCESS_AUD: string;
  readonly ENVIRONMENT: string;
  readonly LOG_LEVEL: string;
}
