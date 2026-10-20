var e=`# Drift ingest contract — \`POST /api/v1/drift/ingest\`

| Field | Value |
|---|---|
| **Status** | Shipped 2026-05-12 (Truehound v34) |
| **Authority** | This document |
| **Reference impl** | [\`bff/src/drift-ingest.js\`](../../bff/src/drift-ingest.js) + route in [\`bff/src/index.js\`](../../bff/src/index.js) |
| **Audit chain event kind** | \`drift.ingested\` — see [\`AUDIT_CHAIN.md\`](AUDIT_CHAIN.md) §3.3 |
| **Companion client** | [\`backstage-plugin/backend/atlasBackendClient.ts\`](../../backstage-plugin/backend/atlasBackendClient.ts) (v33) |

## 1. Why

Truehound's native drift detector (\`bff/src/index.js\` → \`POST
/api/v1/admin/reconcile\`) runs server-side over the catalog the
BFF holds. But many tenants run drift checks **outside** Truehound —
in their Backstage backend (via the v33 plugin scaffold), in
their CI pipeline (via \`cli/lib/checks.js\`), or in their own
homegrown reconcilers.

Without an ingest endpoint, those external findings live in
silos. v34's \`POST /api/v1/drift/ingest\` is the federated path:
external producers push findings; Truehound's central drift
inventory absorbs them with the same dedup + audit semantics
as native findings.

## 2. Producers in scope

| Producer | Wire client | Source field |
|---|---|---|
| Backstage backend plugin | \`BackendAtlasClient.pushFindings()\` (v33) | \`"backstage-plugin"\` |
| \`@truehound/trust-audit\` CLI (in CI mode) | direct fetch | \`"ci-pipeline"\` (convention) |
| Customer-homegrown reconciler | direct fetch | tenant-defined |
| Truehound BFF native reconciler | does NOT use this endpoint — writes the \`drift\` KIND directly | n/a |

## 3. Request shape

\`\`\`jsonc
{
  "source": "backstage-plugin",      // non-empty string; appears on each row + audit metadata
  "run_at": "2026-05-12T12:34:56.000Z", // ISO timestamp of the run that produced these findings
  "findings": [
    {
      "id": "ownership-stale:checkout-api",   // OPTIONAL; if absent, server generates \`\${source}:\${entity_name}:\${rule}\`
      "entity_name": "checkout-api",          // OR camelCase \`entityName\` accepted
      "rule": "ownership-stale",              // OR camelCase \`ruleId\` accepted
      "severity": "high",                     // critical | high | medium | low | info
      "title": "Owner team has departed",     // OPTIONAL; default ""
      "message": "Team \`payments-legacy\` is empty in HRIS.", // OPTIONAL; default ""
      "sources": ["backstage-catalog", "workday"], // OPTIONAL string array
      "at": "2026-05-12T12:34:50.000Z"        // OPTIONAL; if absent, server uses run_at
    }
  ]
}
\`\`\`

### Field rules

- \`source\` is **non-empty string** and MUST appear on every row's
  \`ingest_source\` field after upsert. It MUST also appear on the
  resulting \`drift.ingested\` audit event's metadata.
- \`run_at\` is a parseable ISO-8601 timestamp.
- \`findings\` is an array of length 0-500. Length > 500 returns
  \`batch_too_large\`. Length 0 still appends a \`drift.ingested\`
  audit event (silence is a signal — the run happened, it just
  produced nothing).
- \`severity\` is one of \`critical\`, \`high\`, \`medium\`, \`low\`,
  \`info\`.
- The endpoint accepts BOTH \`snake_case\` (\`entity_name\`, \`rule\`)
  AND \`camelCase\` (\`entityName\`, \`ruleId\`) keys per finding to
  match the Backstage backend's wire shape without a translation
  layer.

## 4. Response shape

### 4.1 Success — 200 OK

\`\`\`jsonc
{
  "accepted": 12,
  "rejected": 0,
  "correlation_id": "drift-ingest-corr-abc123"
}
\`\`\`

The \`correlation_id\` is the audit-event id; clients can grep the
audit log for it to find the matching event later.

### 4.2 Validation failure — 400 Bad Request

\`\`\`jsonc
{
  "error": {
    "code": "drift_ingest_invalid",
    "details": { "failed_index": 2, "failed_reason": "severity 'weird' not in enum" }
  }
}
\`\`\`

Other error codes:

| Code | Cause |
|---|---|
| \`drift_ingest_invalid\` | Per-finding validation failed; \`failed_index\` names the offending row. NOTHING is persisted. |
| \`batch_too_large\` | \`findings.length > 500\`. NOTHING is persisted. |
| \`invalid_body\` | Top-level body is not a JSON object, or \`source\` / \`run_at\` is missing. |

### 4.3 Server obligations

A conforming server MUST:

- **All-or-none**: if ANY finding fails validation, persist
  nothing and return 400.
- **Idempotency**: if \`id\` is supplied (or the server-generated
  \`\${source}:\${entity_name}:\${rule}\` collides), the second
  upsert preserves \`firstSeenAt\` from the first; only
  \`ingested_at\` and the most-recent fields advance.
- **Tenant scoping**: the route is gated by \`requireToken\`; the
  tenant is derived from the bearer token. Findings from
  different tenants MUST NOT collide on \`id\`.
- **Audit append**: exactly ONE \`drift.ingested\` event per
  successful request. The audit metadata carries \`{ source,
  count, run_at, accepted, rejected, correlation_id }\`.
- **Witness rule**: per \`AUDIT_CHAIN.md\` §3.3, \`drift.ingested\`
  is "actor only" — no witnesses required. The producer's token
  is the actor.

A server SHOULD:

- Rate-limit per source. A federated producer flooding the
  endpoint with bogus findings is a denial-of-service vector;
  the v34 ship doesn't yet rate-limit (flagged in
  [\`THREAT_MODEL.md\`](../THREAT_MODEL.md) §6 open questions).

A server MAY:

- Skip the audit event on empty \`findings\` (the v34 reference
  appends always — silence is signal).

## 5. Idempotency examples

Same finding posted twice (with auto-generated id):

\`\`\`
POST 1 → upsert("backstage-plugin:checkout-api:ownership-stale", { ingested_at: T1, firstSeenAt: T1 })
POST 2 → upsert("backstage-plugin:checkout-api:ownership-stale", { ingested_at: T2, firstSeenAt: T1 })
\`\`\`

\`firstSeenAt\` is preserved; \`ingested_at\` advances. The audit
chain shows two \`drift.ingested\` events; the row shows one
finding with two observations.

## 6. Why a discriminator?

Why does each finding's row carry \`ingest_source\` rather than
storing federated findings in a separate KIND?

Three reasons:

1. **Single read surface.** \`/drift\` and \`/api/v1/drift\` already
   exist; consumers don't want to know whether a finding came
   from the BFF reconciler or a Backstage push. Source is a
   filter dimension, not a separate inventory.
2. **Dedup.** A finding may be flagged by both Truehound's native
   reconciler AND the Backstage plugin (each running its own
   schedule). With a stable id, the second-to-write wins on the
   row; both producers appear in the audit log.
3. **Audit clarity.** \`drift.ingested\` (federated) is
   distinguished from \`drift.detected\` (native) so a reviewer
   walking the chain can answer "who told us about this drift?"
   in one query.

## 7. Federated producers and rate limiting

The threat model ([\`THREAT_MODEL.md\`](../THREAT_MODEL.md) §6)
flags \`drift.ingested\` as a federated entry point that could be
abused. A malicious or buggy Backstage backend installed in a
trusted-but-compromised tenant could push thousands of findings.

The v34 ship does **not** rate-limit. Production mitigation
options (any/all):

- Per-\`source\` rate limit at the BFF (e.g., 1000 findings / hr /
  source).
- Per-tenant rate limit at the gateway layer (Cloudflare WAF).
- Sign federated payloads with a per-producer key; reject
  unsigned bulk ingests over a threshold.

This is a \`v35+\` item.

## 8. Reference implementation

- [\`bff/src/drift-ingest.js\`](../../bff/src/drift-ingest.js) —
  validator + ingester.
- [\`bff/src/index.js\`](../../bff/src/index.js) — route
  registration.
- [\`bff/src/drift-ingest.test.js\`](../../bff/src/drift-ingest.test.js)
  — 6 tests covering happy path, validation failure (all-or-none),
  empty array, idempotent re-ingest, batch-too-large, invalid
  \`run_at\`.

Producers:

- [\`backstage-plugin/backend/atlasBackendClient.ts\`](../../backstage-plugin/backend/atlasBackendClient.ts)
  — \`pushFindings()\` (v33).
- \`cli/lib/drift-replay.js\` reads but does not push (it's a
  consumer, not a producer; the CLI's \`drift-replay\` subcommand
  was v30).

## 9. Non-goals

- **Real-time streaming.** This is a batch HTTP endpoint, not a
  long-lived connection. Producers that want streaming should
  buffer + batch on their side.
- **Finding mutation.** Truehound does not mutate findings after
  ingest — they're authored by the producer. Resolution +
  comments live in Truehound's own action store (filed via
  \`propose_action\` on a drift cause).
- **Cross-source merge.** Two producers reporting the same
  drift produce one row (last-writer-wins on the stable id)
  plus two audit events. Truehound does not attempt to reconcile
  divergent severity / message — the most-recent wins.

## 10. Related specs

- [\`AUDIT_CHAIN.md\`](AUDIT_CHAIN.md) — \`drift.ingested\` event kind.
- [\`MCP_TRUTH_LAYER_EXTENSION.md\`](MCP_TRUTH_LAYER_EXTENSION.md)
  — agents reading drift via \`drift_for_service\` see federated
  findings indistinguishably from native ones.
- [\`THREAT_MODEL.md\`](../THREAT_MODEL.md) — rate-limit gap
  documented as a v35+ follow-up.
`;export{e as default};