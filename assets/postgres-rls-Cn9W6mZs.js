var e=`-- ──────────────────────────────────────────────────────────────────
--  Truehound Postgres backend — Row-Level Security policies
-- ──────────────────────────────────────────────────────────────────
--
-- The defence-in-depth pass on top of the WHERE-clause-only model
-- in \`postgres.js\`. Per docs/ENTERPRISE_READINESS.md § 5: a missing
-- WHERE tenant_id is the #1 multi-tenant exfiltration pattern. RLS
-- makes that mistake impossible at the database layer.
--
-- Apply once to a fresh database, after the schema in postgres.js
-- has been created. Idempotent — safe to re-run.
--
-- The pattern:
--   1. Enable RLS on every tenant-scoped table.
--   2. Create a SECURITY policy keyed on the session-local
--      \`app.tenant_id\` setting.
--   3. The application sets \`app.tenant_id\` per-request before
--      issuing any query (see \`postgres.js\` patch below).
--   4. Postgres enforces \`tenant_id = current_setting('app.tenant_id')\`
--      transparently; a query that "forgets" the WHERE returns zero
--      rows instead of leaking another tenant's data.
--
-- Pen-test value: an authenticated tenant whose code path drops the
-- WHERE clause (deliberately or via a regression) cannot read or
-- write across tenant boundaries. The FORCE ROW LEVEL SECURITY
-- option also applies the policy to the database superuser used by
-- the Truehound application role, eliminating the bypass that catches
-- most teams in pen testing.
--
-- App-side enforcement: every per-tenant query in postgres.js runs
-- through the \`withTenant(tenantId, fn)\` helper, which calls
-- \`SELECT set_config('app.tenant_id', $1, true)\` on a pinned client
-- inside a transaction before invoking the callback. The setting is
-- LOCAL so it disappears when the connection is returned to the pool.

BEGIN;

-- ──────────────────────────────────────────────────────────────────
-- 1. Custom GUC for the tenant id
-- ──────────────────────────────────────────────────────────────────
-- Postgres allows arbitrary GUCs prefixed with a custom namespace.
-- \`app.tenant_id\` is set per-transaction by the application via
-- \`set_config('app.tenant_id', $1, true)\` in postgres.js#withTenant.
--
-- There is deliberately NO database-level default for this GUC. Setting
-- one requires a literal database identifier, and the statement that
-- used to sit here passed a function call instead — a hard syntax error
-- (SQLSTATE 42601). Because this file is a single BEGIN/COMMIT, that
-- first statement aborted the ENTIRE transaction: no table ever got
-- ENABLE/FORCE RLS and no policy was ever created. The isolation this
-- file exists to provide had never once been applied.
--
-- A default is not needed anyway. Every policy reads the GUC with
-- \`current_setting('app.tenant_id', true)\` — the \`true\` is missing_ok,
-- so an unset GUC yields NULL, \`tenant_id = NULL\` evaluates to NULL,
-- and the row is filtered out. Unset therefore already means "zero
-- rows", which is exactly the fail-closed behaviour we want.

-- ──────────────────────────────────────────────────────────────────
-- 2. Enable + force RLS on every tenant-scoped table
-- ──────────────────────────────────────────────────────────────────

ALTER TABLE services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services        FORCE ROW LEVEL SECURITY;

ALTER TABLE incidents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents       FORCE ROW LEVEL SECURITY;

ALTER TABLE monitors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors        FORCE ROW LEVEL SECURITY;

ALTER TABLE json_rows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE json_rows       FORCE ROW LEVEL SECURITY;

ALTER TABLE audit           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit           FORCE ROW LEVEL SECURITY;

ALTER TABLE webhook_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_idempotency FORCE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────
-- 3. Tenant-isolation policy on each table
-- ──────────────────────────────────────────────────────────────────
-- Each policy is named after the table for clarity. Both USING
-- (read filter) and WITH CHECK (write filter) clauses are set so
-- the same tenant_id is enforced on SELECT, INSERT, UPDATE, DELETE.
--
-- Every CREATE is preceded by a DROP ... IF EXISTS so re-applying this
-- file is genuinely idempotent. Postgres has no CREATE POLICY IF NOT
-- EXISTS, and the previous design leaned on a re-run ABORTING with
-- SQLSTATE 42710 and having apply-rls.mjs read that abort as success —
-- so a transaction that rolled back before creating most of these
-- policies still reported "already applied". Dropping first makes the
-- apply converge instead of relying on a swallowed error.

DROP POLICY IF EXISTS services_tenant_isolation ON services;
CREATE POLICY services_tenant_isolation ON services
  USING       (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK  (tenant_id = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS incidents_tenant_isolation ON incidents;
CREATE POLICY incidents_tenant_isolation ON incidents
  USING       (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK  (tenant_id = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS monitors_tenant_isolation ON monitors;
CREATE POLICY monitors_tenant_isolation ON monitors
  USING       (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK  (tenant_id = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS json_rows_tenant_isolation ON json_rows;
CREATE POLICY json_rows_tenant_isolation ON json_rows
  USING       (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK  (tenant_id = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS audit_tenant_isolation ON audit;
CREATE POLICY audit_tenant_isolation ON audit
  USING       (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK  (tenant_id = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS webhook_idempotency_tenant_isolation ON webhook_idempotency;
CREATE POLICY webhook_idempotency_tenant_isolation ON webhook_idempotency
  USING       (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK  (tenant_id = current_setting('app.tenant_id', true));

-- ──────────────────────────────────────────────────────────────────
-- 4. Application role (least-privilege)
-- ──────────────────────────────────────────────────────────────────
-- The Truehound BFF connects as \`atlas_app\`, *not* as the database
-- superuser. The role has SELECT / INSERT / UPDATE / DELETE on the
-- tenant tables but no DDL privileges. The combination of FORCE RLS
-- + this role means even a SQL-injection-with-DROP-TABLE attempt
-- fails on the privilege check before RLS is consulted.

-- The role is created NOLOGIN and without a password. It previously
-- shipped with a committed literal credential on a role holding
-- SELECT/INSERT/UPDATE/DELETE over every tenant table — live on any
-- database where the operator never got around to changing it. Grant
-- login explicitly at deploy time with a generated secret, or leave it
-- NOLOGIN and connect via IAM auth / a peer-authenticated role that has
-- been granted atlas_app. See charts/atlas-bff for the deploy wiring.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'atlas_app') THEN
    CREATE ROLE atlas_app NOLOGIN;
  END IF;
END$$;

-- GRANT CONNECT needs a literal database identifier, so it has to go
-- through dynamic SQL. Naming the current database with a function call
-- directly is a syntax error — the same class of bug as the statement
-- removed from section 1.
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO atlas_app', current_database());
END$$;
GRANT USAGE ON SCHEMA public TO atlas_app;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON services, incidents, monitors, json_rows, audit, webhook_idempotency
  TO atlas_app;

-- The \`atlas_app\` role is *not* exempt from RLS. The BYPASSRLS
-- privilege is reserved for an \`atlas_admin\` role used only for
-- migrations + cross-tenant analytics jobs.

-- ──────────────────────────────────────────────────────────────────
-- 5. Verification view (for pen tests)
-- ──────────────────────────────────────────────────────────────────
-- Spot-check that RLS is enforced on every expected table.

CREATE OR REPLACE VIEW _atlas_rls_status AS
SELECT
  schemaname || '.' || tablename AS table,
  rowsecurity AS rls_enabled,
  forcerowsecurity AS rls_forced
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('services', 'incidents', 'monitors', 'json_rows', 'audit', 'webhook_idempotency');

GRANT SELECT ON _atlas_rls_status TO atlas_app;

COMMIT;

-- ──────────────────────────────────────────────────────────────────
-- After applying:
--
--   psql> SELECT * FROM _atlas_rls_status;
--    table                                | rls_enabled | rls_forced
--   --------------------------------------+-------------+------------
--    public.services                      | t           | t
--    public.incidents                     | t           | t
--    ...
--
-- The app-layer enforcement lives in postgres.js. Every public method
-- (list / get / upsert / listAudit / appendAudit / pruneAudit / reset
-- / claimIdempotency) routes through \`withTenant(tenantId, async (client) => ...)\`.
-- The helper opens a transaction, sets \`app.tenant_id\` via
-- \`set_config(..., true)\` (LOCAL scope), and rolls back on error so
-- the GUC never leaks to another tenant's checkout.
-- ──────────────────────────────────────────────────────────────────
`;export{e as default};