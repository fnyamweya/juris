# JUSRIS Architecture

## Platform Overview

JUSRIS is a Cloudflare-native, multi-tenant legal AI platform. All runtime logic runs on Cloudflare Workers. Tenants are physically isolated via dedicated D1, R2, and Vectorize resources.

## System Diagram

```
Client
  │
  ▼
Cloudflare Access (JWT)
  │
  ▼
Dispatch Worker (tenant resolution, auth verification)
  │
  ▼
Tenant Runtime Worker (tenant-scoped API)
  │
  ├── D1 (tenant DB)
  ├── R2 (tenant blobs)
  └── Vectorize (tenant embeddings)
```

## Worker Topology

| Worker | Responsibility |
|--------|----------------|
| **dispatch-worker** | Route by host/path, verify JWT, resolve tenant, forward to tenant-runtime |
| **tenant-runtime-worker** | Tenant-scoped API: documents, RAG, matters, users |
| **provisioning-worker** | Tenant lifecycle: create D1/R2/Vectorize, apply schema |
| **ingestion-worker** | Parse documents, chunk, embed, store |
| **webhook-worker** | Handle external webhooks |
| **maintenance-worker** | Scheduled jobs, cleanup, migrations |

## Tenant Isolation Model

- **Master registry** (single D1): tenants, provisioning_operations, tenant_resources, outbox
- **Tenant DB** (per-tenant D1): users, principals, matters, documents, embeddings metadata
- **Tenant R2** (per-tenant bucket): document blobs
- **Tenant Vectorize** (per-tenant index): embeddings

No cross-tenant data access. Dispatch enforces tenant context before forwarding.

## Request Lifecycle

1. Client → Cloudflare edge
2. CF Access validates JWT (if protected route)
3. Dispatch Worker: parse host/path → resolve tenant from registry
4. Dispatch verifies JWT claims, builds internal headers (`x-jusris-tenant-id`, `x-jusris-actor-id`)
5. Forward to Tenant Runtime Worker with tenant context
6. Tenant Runtime: load tenant D1/R2/Vectorize bindings, execute request
7. Response → Client

## Auth Flow

```
CF Access JWT → Dispatch verification → Principal resolution (tenant DB)
```

- JWT contains identity (e.g. email, subject)
- Dispatch maps to tenant; rejects if tenant mismatch
- Tenant Runtime resolves principal from tenant DB (users, principals)
- Access control (RBAC/ReBAC/ABAC) applied per request

## Provisioning Flow

State machine (provisioning_operations):

```
REGISTRY_COMMITTED → D1_PROVISIONED → TENANT_SCHEMA_APPLIED
  → VECTOR_INDEX_PROVISIONED → R2_PROVISIONED
  → ACCESS_POLICY_CONFIGURED → ROUTING_REGISTERED → ACTIVE
```

Each step idempotent; retries on failure. Rollback on persistent failure.

## Data Model Overview

### Master Registry (control plane)

- `tenants` — tenant metadata, status, tier
- `tenant_resources` — D1/R2/Vectorize IDs per tenant
- `provisioning_operations` — provisioning state machine
- `outbox_messages` — transactional outbox for events

### Tenant DB (runtime)

- `users`, `principals` — identity
- `roles`, `policies`, `role_bindings` — access control
- `matters`, `documents`, `document_chunks` — domain data
- `clients`, `embeddings_metadata` — supporting entities

## Ingestion Pipeline

```
Document upload → Parse (PDF, etc.) → Chunk → Embed → Store
  - Chunks → tenant D1 (document_chunks)
  - Embeddings → tenant Vectorize
  - Blobs → tenant R2
```

## RAG Pipeline

```
Query → Embed query → Vectorize search → Retrieve chunks
  → Assemble prompt → LLM → Response
```

- Embedding client produces query vector
- Retrieval orchestrator fetches top-k chunks
- Prompt assembly injects context into LLM prompt

## Security Layers

1. **Edge**: CF Access (JWT)
2. **Dispatch**: Tenant resolution, JWT verification, header injection
3. **Tenant Runtime**: Principal resolution, RBAC/ReBAC/ABAC
4. **Data**: Per-tenant bindings, no cross-tenant queries

## Package Dependency Graph (text)

```
@jusris/domain (core, no deps)
@jusris/types
@jusris/tsconfig

@jusris/schemas → domain
@jusris/config
@jusris/observability

@jusris/auth → domain, config
@jusris/crypto → config
@jusris/security → auth, crypto, domain
@jusris/access-control → domain
@jusris/audit → domain, observability

@jusris/cloudflare → types
@jusris/data → domain, cloudflare
@jusris/queueing

@jusris/ingestion → domain, observability
@jusris/rag → domain

dispatch-worker → auth, config, domain, observability, security
tenant-runtime-worker → auth, data, domain, rag, ...
provisioning-worker → cloudflare, data, domain, observability
ingestion-worker → ingestion, rag, ...
```

## Performance Architecture

- **Edge execution** — low latency, global distribution
- **D1** — SQLite at edge, transactional
- **R2** — object storage, no egress fees
- **Vectorize** — vector search at edge
- **Stateless workers** — horizontal scaling

## Operational Model

- Migrations: `db:migrate:registry`, `db:migrate:tenant`
- Observability: structured logs, trace IDs, request IDs
- Fail at the gate: invalid auth/tenant → immediate reject
