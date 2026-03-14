export interface WorkerBindings {
  readonly [key: string]: unknown;
}

export interface QueueMessage<T = unknown> {
  readonly id: string;
  readonly timestamp: Date;
  readonly body: T;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
}

export interface ScheduledEvent {
  readonly scheduledTime: number;
  readonly cron: string;
}
