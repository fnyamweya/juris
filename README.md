# Juris — Enterprise Legal AI Platform

Juris is a Cloudflare-native, multi-tenant legal AI platform for enterprise document management, retrieval-augmented generation (RAG), and intelligent workflows.

## Architecture Overview

- **Monorepo**: pnpm workspaces + Turborepo
- **Runtime**: Cloudflare Workers (edge-first)
- **Multi-tenant**: Per-tenant D1, R2, Vectorize; strict isolation
- **Auth**: Cloudflare Access JWT, enterprise SSO

## Repository Structure

### Apps

| App                          | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `apps/dispatch-worker`       | Request routing, tenant resolution, auth boundary |
| `apps/tenant-runtime-worker` | Tenant-scoped API, RAG, document operations       |
| `apps/provisioning-worker`   | Tenant lifecycle, D1/R2/Vectorize provisioning    |
| `apps/ingestion-worker`      | Document ingestion, parsing, embedding pipeline   |
| `apps/webhook-worker`        | External webhook handling                         |
| `apps/maintenance-worker`    | Scheduled jobs, cleanup, migrations               |
| `apps/dashboard`             | Admin UI (Next.js)                                |
| `apps/web`                   | Public/marketing site (Next.js)                   |

### Packages

| Package                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `@jusris/ui`             | Design system, `cn` utility, shared components |
| `@jusris/domain`         | Domain models, types, invariants               |
| `@jusris/types`          | Shared API/Cloudflare type definitions         |
| `@jusris/schemas`        | Validation schemas (Zod)                       |
| `@jusris/auth`           | Auth primitives, JWT handling                  |
| `@jusris/security`       | Crypto, envelope encryption                    |
| `@jusris/access-control` | RBAC, ReBAC, ABAC                              |
| `@jusris/audit`          | Audit logging, custody ledger                  |
| `@jusris/crypto`         | Key management, encryption helpers             |
| `@jusris/config`         | Environment, feature flags                     |
| `@jusris/cloudflare`     | CF API client, D1/R2/Vectorize wrappers        |
| `@jusris/data`           | Data access abstractions                       |
| `@jusris/ingestion`      | Document parsing, chunking                     |
| `@jusris/rag`            | Embedding, retrieval, prompt assembly          |
| `@jusris/observability`  | Logging, tracing, metrics                      |
| `@jusris/queueing`       | Queue abstractions                             |
| `@jusris/tsconfig`       | Shared TypeScript configs                      |
| `@jusris/testing`        | Test utilities                                 |
| `@jusris/eslint-config`  | Shared ESLint config                           |

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **Wrangler CLI** (Cloudflare Workers)

```bash
npm install -g pnpm wrangler
```

## Getting Started

```bash
git clone <repo-url>
cd juris
pnpm install
pnpm dev
```

## Development Commands

| Command                 | Description                 |
| ----------------------- | --------------------------- |
| `pnpm build`            | Build all packages and apps |
| `pnpm dev`              | Run dev servers (Turborepo) |
| `pnpm typecheck`        | Type-check all packages     |
| `pnpm lint`             | Lint all packages           |
| `pnpm lint:fix`         | Lint and auto-fix           |
| `pnpm test`             | Run all tests               |
| `pnpm test:unit`        | Unit tests only             |
| `pnpm test:integration` | Integration tests           |
| `pnpm format`           | Format with Prettier        |
| `pnpm format:check`     | Check formatting            |
| `pnpm clean`            | Remove build artifacts      |

## Deployment

- **Workers**: `wrangler deploy` per app (CI/CD)
- **Dashboard/Web**: Vercel or similar (static/SSR)
- **Migrations**: `pnpm db:migrate:registry`, `pnpm db:migrate:tenant`

## Contributing

1. Create a feature branch from `main`
2. Follow conventional commits
3. Ensure `pnpm typecheck`, `pnpm lint`, `pnpm test` pass
4. Open a PR; changesets for versioning

## License

Proprietary — UNLICENSED. All rights reserved.
