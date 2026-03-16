# AGENTS.md — AI Assistant Guidance

## Project

**Juris** — Cloudflare-native multi-tenant legal AI platform.

## Architecture

- Monorepo (pnpm + Turborepo)
- Cloudflare Workers (dispatch, tenant-runtime, provisioning, ingestion, webhook, maintenance)
- Per-tenant D1, R2, Vectorize
- Auth at boundary (CF Access JWT → dispatch verification)

## Key Rules

1. **No mutable global state** — workers are stateless; state in D1/R2/KV
2. **Tenant isolation mandatory** — never cross tenant boundaries in data access
3. **Auth at boundary** — verify before any tenant-scoped work
4. **Domain naming** — use `@juris/domain` types; avoid ad-hoc shapes
5. **Fail at the gate** — invalid tenant/auth → reject immediately, no partial work

## Test Requirements

- **Unit tests** for all packages (Vitest)
- **Integration tests** for workers and data flows
- **Security tests** for auth, crypto, tenancy (no cross-tenant leaks)

## Key Packages

| Package                 | Purpose                          |
| ----------------------- | -------------------------------- |
| `@juris/domain`         | Domain models, types, invariants |
| `@juris/auth`           | Auth primitives                  |
| `@juris/security`       | Crypto, envelope encryption      |
| `@juris/access-control` | RBAC, ReBAC, ABAC                |
| `@juris/data`           | D1/R2/Vectorize abstractions     |
| `@juris/rag`            | Embedding, retrieval, prompts    |
| `@juris/ui`             | Design system, `cn`, components  |

## Style

- **Explicit** — avoid magic; prefer named functions and clear control flow
- **Typed** — strict TypeScript; no `any` without justification
- **Boring by default** — standard patterns over cleverness
- **Dependency-injected** — pass deps (db, logger, cfApi) via constructors; no globals
