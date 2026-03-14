export interface IngestionWorkerEnv {
  readonly INGESTION_QUEUE: Queue;
  readonly AI: Ai;
  readonly ENVIRONMENT: string;
  readonly LOG_LEVEL: string;
}
