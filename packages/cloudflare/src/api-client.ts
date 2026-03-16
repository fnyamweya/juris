import type { Logger } from '@juris/observability';

export class CloudflareApiError extends Error {
  readonly statusCode: number;
  readonly errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string, cause?: unknown) {
    super(message);
    this.name = 'CloudflareApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    if (cause !== undefined) {
      this.cause = cause;
    }
    Object.setPrototypeOf(this, CloudflareApiError.prototype);
  }
}

export interface VectorizeConfig {
  dimensions: number;
  metric: 'cosine' | 'euclidean' | 'dot-product';
}

export interface CustomHostnameConfig {
  ssl: { method: 'http' | 'cname'; type: 'dv' };
}

export interface CloudflareApiClient {
  createD1Database(name: string): Promise<{ id: string }>;
  deleteD1Database(id: string): Promise<void>;
  createR2Bucket(name: string): Promise<{ name: string }>;
  deleteR2Bucket(name: string): Promise<void>;
  createVectorizeIndex(name: string, config: VectorizeConfig): Promise<{ name: string }>;
  deleteVectorizeIndex(name: string): Promise<void>;
  createCustomHostname(
    hostname: string,
    config: CustomHostnameConfig,
  ): Promise<{ id: string; status: string }>;
  deleteCustomHostname(id: string): Promise<void>;
}

const BASE_URL = 'https://api.cloudflare.com/client/v4';

export function createCloudflareApiClient(params: {
  accountId: string;
  apiToken: string;
  logger: Logger;
}): CloudflareApiClient {
  const { accountId, apiToken, logger } = params;

  interface CfApiResponse<R> {
    success?: boolean;
    result?: R;
    errors?: Array<{ message?: string; code?: number }>;
  }

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${BASE_URL}${path}`;
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      const data: CfApiResponse<T> = JSON.parse(text) as CfApiResponse<T>;
      if (!res.ok) {
        const errMsg = data.errors?.[0]?.message ?? `HTTP ${res.status}: ${res.statusText}`;
        const errCode = data.errors?.[0]?.code?.toString();
        logger.error('Cloudflare API error', {
          method,
          path,
          statusCode: res.status,
          errorCode: errCode,
        });
        throw new CloudflareApiError(errMsg, res.status, errCode);
      }
      if (data.success === false && data.errors?.length) {
        const err = data.errors[0];
        if (err) {
          throw new CloudflareApiError(
            err.message ?? 'Unknown API error',
            res.status,
            err.code?.toString(),
          );
        }
      }
      return (data.result ?? data) as T;
    } catch (err) {
      if (err instanceof CloudflareApiError) throw err;
      logger.error('Cloudflare API request failed', {
        method,
        path,
        error: err instanceof Error ? err.message : String(err),
      });
      throw new CloudflareApiError(
        err instanceof Error ? err.message : 'Request failed',
        0,
        undefined,
        err,
      );
    }
  }

  return {
    async createD1Database(name: string): Promise<{ id: string }> {
      const result = (await request<{ id: string }>('POST', `/accounts/${accountId}/d1/database`, {
        name,
      })) as { id: string };
      return { id: result.id };
    },

    async deleteD1Database(id: string): Promise<void> {
      await request('DELETE', `/accounts/${accountId}/d1/database/${id}`);
    },

    async createR2Bucket(name: string): Promise<{ name: string }> {
      await request('POST', `/accounts/${accountId}/r2/buckets`, {
        name,
        location: 'WEUR',
      });
      return { name };
    },

    async deleteR2Bucket(name: string): Promise<void> {
      await request('DELETE', `/accounts/${accountId}/r2/buckets/${name}`);
    },

    async createVectorizeIndex(name: string, config: VectorizeConfig): Promise<{ name: string }> {
      await request('POST', `/accounts/${accountId}/vectorize/indexes`, {
        name,
        config: {
          dimensions: config.dimensions,
          metric: config.metric,
        },
      });
      return { name };
    },

    async deleteVectorizeIndex(name: string): Promise<void> {
      await request('DELETE', `/accounts/${accountId}/vectorize/indexes/${name}`);
    },

    async createCustomHostname(
      hostname: string,
      config: CustomHostnameConfig,
    ): Promise<{ id: string; status: string }> {
      const result = (await request<{ id: string; status: string }>(
        'POST',
        `/zones/${accountId}/custom_hostnames`,
        { hostname, ssl: config.ssl },
      )) as { id: string; status: string };
      return { id: result.id, status: result.status };
    },

    async deleteCustomHostname(id: string): Promise<void> {
      await request('DELETE', `/zones/${accountId}/custom_hostnames/${id}`);
    },
  };
}
