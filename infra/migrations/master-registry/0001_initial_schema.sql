CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'REGULATED')),
  status TEXT NOT NULL DEFAULT 'INITIATED'
    CHECK (status IN (
      'INITIATED', 'PROVISIONING', 'ACTIVE', 'SUSPENDED',
      'DEPROVISION_REQUESTED', 'DEPROVISIONING', 'DELETED'
    )),
  admin_email TEXT NOT NULL,
  custom_domain TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain);

CREATE TABLE IF NOT EXISTS tenant_resources (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('D1', 'R2', 'VECTORIZE', 'WORKER', 'CUSTOM_HOSTNAME', 'KV')),
  resource_identifier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROVISIONING'
    CHECK (status IN ('PROVISIONING', 'ACTIVE', 'FAILED', 'DELETING', 'DELETED')),
  metadata TEXT,
  provisioned_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_tenant_resources_tenant ON tenant_resources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_resources_type ON tenant_resources(tenant_id, resource_type);

CREATE TABLE IF NOT EXISTS provisioning_operations (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('PROVISION', 'DEPROVISION', 'UPGRADE', 'MIGRATE')),
  current_step TEXT NOT NULL,
  previous_step TEXT,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS'
    CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'ROLLED_BACK', 'MANUAL_INTERVENTION')),
  error_message TEXT,
  error_code TEXT,
  retries_remaining INTEGER NOT NULL DEFAULT 5,
  idempotency_key TEXT NOT NULL UNIQUE,
  step_history TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_provisioning_ops_tenant ON provisioning_operations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_provisioning_ops_status ON provisioning_operations(status);
CREATE INDEX IF NOT EXISTS idx_provisioning_ops_idempotency ON provisioning_operations(idempotency_key);

CREATE TABLE IF NOT EXISTS outbox_messages (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
  retries INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  published_at TEXT,
  failed_at TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox_messages(status, created_at);

CREATE TABLE IF NOT EXISTS custom_domains (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  hostname TEXT NOT NULL UNIQUE,
  cf_hostname_id TEXT,
  ssl_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (ssl_status IN ('PENDING', 'ACTIVE', 'FAILED', 'DELETED')),
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'FAILED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_tenant ON custom_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_hostname ON custom_domains(hostname);

CREATE TABLE IF NOT EXISTS hostname_routes (
  hostname TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  worker_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_hostname_routes_tenant ON hostname_routes(tenant_id);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT,
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  metadata TEXT,
  previous_hash TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  signature_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant ON audit_events(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action, created_at);

CREATE TABLE IF NOT EXISTS billing_usage_rollups (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(tenant_id, period_start, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_billing_rollups_tenant ON billing_usage_rollups(tenant_id, period_start);

CREATE TABLE IF NOT EXISTS compliance_holds (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  reason TEXT NOT NULL,
  placed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'RELEASED')),
  placed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  released_at TEXT,
  released_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_compliance_holds_tenant ON compliance_holds(tenant_id, status);

CREATE TABLE IF NOT EXISTS deletion_requests (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'IN_PROGRESS', 'BLOCKED_BY_HOLD', 'COMPLETED', 'CANCELLED')),
  reason TEXT,
  data_export_url TEXT,
  export_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_tenant ON deletion_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);

CREATE TABLE IF NOT EXISTS admin_interventions (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT REFERENCES tenants(id),
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_interventions_tenant ON admin_interventions(tenant_id);
