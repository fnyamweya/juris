# Security

## Security Posture

Juris follows **zero trust** and **defense in depth**. All access is authenticated and authorized at the boundary. No implicit trust between services.

## Reporting Vulnerabilities

Report security issues to **security@juris.com**. Do not open public issues for vulnerabilities.

## Encryption

- **TLS 1.3** for all transport
- **Application-level envelope encryption** (AES-256-GCM) for sensitive data at rest
- Keys never stored in code; injected via environment

## Tenant Isolation

- **Per-tenant D1, R2, Vectorize** — no shared mutable state
- **Dispatch boundary** — tenant resolved before any data access
- Cross-tenant access is architecturally impossible

## Authentication

- **Cloudflare Access JWT** at edge
- **Enterprise SSO** (SAML/OIDC) for internal users
- Service-to-service: internal auth headers (`x-juris-tenant-id`, `x-juris-actor-id`)

## Authorization

- **Layered model**: RBAC + ReBAC + ABAC
- **Default deny** — explicit grants required
- Scoped to tenant, matter, document

## Audit

- **Signed hash chains** for tamper-evident logs
- **Custody ledger** for document lifecycle
- Audit events immutable

## Data Handling

- **PII redaction** in logs and exports
- **Key rotation** supported; no long-lived static keys
- **Data minimization** — collect only what is required

## Compliance

- **Retention policies** configurable per tenant
- **Compliance holds** for legal/regulatory
- **Export/purge** for GDPR and similar

## Infrastructure

- **Cloudflare edge** — no shared mutable state between requests
- Stateless workers; state in D1/R2/KV

## Secrets Management

- **No secrets in code** — environment variables or secret stores
- **Env validation at startup** — fail fast if required secrets missing
