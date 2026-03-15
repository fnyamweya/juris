import type { Logger } from '@jusris/observability';

export interface EmbeddingClient {
  embed(texts: string[]): Promise<number[][]>;
}

export function createEmbeddingClient(_gateway: unknown, _logger: Logger): EmbeddingClient {
  return {
    async embed(texts: string[]): Promise<number[][]> {
      return texts.map(() => []);
    },
  };
}
