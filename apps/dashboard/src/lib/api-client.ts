import type { Matter, MatterId, DocumentId } from '@jusris/domain';

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function createApiClient(baseUrl: string) {
  const headers = (): HeadersInit => ({
    'Content-Type': 'application/json',
    'X-Request-ID': generateRequestId(),
  });

  return {
    async getMatters(): Promise<{ matters: Matter[] }> {
      const res = await fetch(`${baseUrl}/api/matters`, { headers: headers() });
      if (!res.ok) throw new Error(`Failed to fetch matters: ${res.status}`);
      return (await res.json()) as { matters: Matter[] };
    },

    async getMatter(matterId: MatterId): Promise<Matter> {
      const res = await fetch(`${baseUrl}/api/matters/${matterId}`, {
        headers: headers(),
      });
      if (!res.ok) throw new Error(`Failed to fetch matter: ${res.status}`);
      return (await res.json()) as Matter;
    },

    async getDocuments(params?: {
      matterId?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ documents: unknown[]; total: number }> {
      const search = new URLSearchParams();
      if (params) {
        if (params.matterId !== undefined) search.set('matterId', params.matterId);
        if (params.limit !== undefined) search.set('limit', String(params.limit));
        if (params.offset !== undefined) search.set('offset', String(params.offset));
      }
      const res = await fetch(`${baseUrl}/api/documents?${search}`, {
        headers: headers(),
      });
      if (!res.ok) throw new Error(`Failed to fetch documents: ${res.status}`);
      return (await res.json()) as { documents: unknown[]; total: number };
    },

    async getDocument(documentId: DocumentId): Promise<unknown> {
      const res = await fetch(`${baseUrl}/api/documents/${documentId}`, {
        headers: headers(),
      });
      if (!res.ok) throw new Error(`Failed to fetch document: ${res.status}`);
      return (await res.json()) as unknown;
    },

    async search(query: string): Promise<{ results: unknown[] }> {
      const res = await fetch(`${baseUrl}/api/search`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      return (await res.json()) as { results: unknown[] };
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
