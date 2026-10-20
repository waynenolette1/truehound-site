var e=`# Compass → Truehound migration runbook

| Field | Value |
|---|---|
| **Audience** | The operator running a Compass-to-Truehound migration. Typically platform-engineering lead + a security/IT-procurement reviewer. |
| **When to run** | Compass tenant has decided to land on Truehound. Renewals end 2026-12-31. |
| **Time** | ~60 minutes for components; +30 minutes if importing scorecard rules; +half-day if writing custom rule stubs by hand. |
| **Reversibility** | **Not gated, and no revert window.** The wizard's Apply marks the candidates imported and records a local audit entry. The two-key Actions approval and 24h revert that earlier versions of this runbook described aren't built (\`src/pages/CompassImport.tsx\`: "Demo action: in production this runs the BFF's two-key Apply"). Review the preview before you press Apply. |
| **Last reviewed** | 2026-05-17 |
| **Last drilled** | 2026-06-02 |

## Pre-flight

1. **Compass API token in hand.** Either email-and-token (Basic) or an OAuth bearer.
2. **Compass cloud-id.** Available from \`https://<your>.atlassian.net/_edge/tenant_info\`.
3. **Truehound tenant up.** Either the public demo (request access) or a self-hosted BFF.
4. **Node ≥ 22** on the operator's workstation (the CLI's \`engines\` in \`cli/package.json\`).

## Step 1 — Export from Compass

\`\`\`
npx -y @truehound/trust-audit compass-export \\
  --cloud-id $CLOUD_ID \\
  --token $COMPASS_TOKEN \\
  --include-scorecards \\
  --output ./compass-export.json
\`\`\`

What this does:
- Paginates \`GET /compass/{cloudId}/components\` (up to 5000 components / 50 pages).
- Fetches \`GET /compass/{cloudId}/scorecards?limit=200\` if \`--include-scorecards\` is passed. That's one request, not paginated (\`cli/lib/compass-export.js\`), so if you have more than 200 scorecards, compare the count in the file against Compass.
- Normalises the shape (all 7 component types, every link kind, every relationship edge, custom fields, scorecard score).
- Writes a JSON file the wizard accepts directly.

Sanity-check the file:

\`\`\`
node -e "const j=require('./compass-export.json'); console.log(j.components.length, 'components'); console.log(j.scorecards?.length ?? 0, 'scorecards')"
\`\`\`

**Don't have credentials yet?** \`--mock\` skips the network and writes a fixture so you can rehearse:

\`\`\`
npx -y @truehound/trust-audit compass-export --mock --include-scorecards --output ./compass-export.json
\`\`\`

## Step 2 — Component preview

1. Open \`/integrations/compass-import\` in your Truehound tenant.
2. Click **Upload .json** and pick \`compass-export.json\` from step 1.
3. Read the right-hand summary card:
   - **Detected** — confirm it shows \`Compass REST\` (or \`compass.yml\`), not \`unknown\`.
   - **Will create / update** — every component going through.
   - **Skipped** — should be only LIBRARY / WEBSITE / OTHER components. If a SERVICE is being skipped, the component is malformed; fix and re-export.
   - **Dependency edges** — shows the total \`DEPENDS_ON / DEPENDED_BY / REPLACES / REPLACED_BY\` edges that will land.
   - **With custom fields** — confirms \`fields\` got through.
4. Scroll the **"Will land in Truehound"** card. Each row shows the repo badge, link count, dep count, custom-field count, and scorecard score — so you can see at a glance what's preserved.
5. The **Link kinds preserved** card breaks down REPOSITORY → repoUrl + DASHBOARD / DOCUMENT / ON_CALL / CHAT_CHANNEL / PROJECT preserved on \`Service.links[]\`.

## Step 3 — Scorecard-rule preview (optional)

The same page has a **Compass scorecard rules** section below the components.

1. Paste your \`scorecards\` array (or paste the whole \`{ components, scorecards }\` envelope; it auto-detects).
2. Read the per-rule outcome:
   - **MAPPED** (green) — the Compass criterion has a 1:1 Truehound \`ScorecardRule\`. Lands automatically.
   - **PARTIAL** (warning) — closest match has a semantic gap. Read the note and decide whether to accept.
   - **MANUAL** (destructive) — Compass criterion expresses a custom predicate (custom-field equality, regex, metric threshold). Copy the emitted TypeScript stub into \`src/data/truth/scorecards.ts\` and review.
3. The summary chip at the top of the section gives the mapped / partial / manual totals so you know up front how much hand-work is left.

## Step 4 — Apply

1. Press **Apply N services** on the wizard.
2. Apply marks the previewed candidates imported and records one entry in the local action log (\`actionStore.recordAudit\` in \`src/pages/CompassImport.tsx\`). It does **not** go through the two-key Actions approval, and nobody else reviews it; the page's own notice says "Demo action: in production this runs the BFF's two-key Apply."
3. There is no revert window, so review the preview before you press Apply.

## Step 5 — Verify

Spot-check in this order — each takes < 60 seconds:

1. **\`/services\`** — count matches the wizard's preview count.
2. **Pick a tier-1 service**, click into the profile:
   - Repo URL renders in the hero.
   - **Custom data** card shows the imported fields.
   - **Links** card renders dashboards / on-call / docs grouped by kind.
   - **Activity** drawer shows the apply action.
3. **\`/service-map\`** — dependency edges from the Compass relationship graph should appear.
4. **\`/audit\`** — the apply event is sealed into the SHA-256 chain. Click "verify" to re-hash from genesis.

## Step 6 — Live Compass sync: not available today

Truehound's BFF has a Compass ingest route, \`POST /api/v1/webhooks/compass\`, but **nothing Atlassian ships can call it successfully today**, so there is no live Compass → Truehound sync to switch on during the cut-over:

- **What the route requires.** A tenant bearer token (\`requireToken\`, \`bff/src/routes/webhooks.js\`) **and** a hex HMAC-SHA256 of the exact request body in \`x-atlassian-webhook-identifier\`, keyed with \`ATLAS_WEBHOOK_SECRET_COMPASS\` (\`bff/src/auth-webhook.js\`). With no secret configured, every delivery gets 401 unless \`ATLAS_DEMO_MODE=1\`.
- **What Atlassian sends in that header.** Atlassian documents \`X-Atlassian-Webhook-Identifier\` as a delivery identifier that is the same across retries, not a signature. Its signed webhooks carry the HMAC in \`X-Hub-Signature\` instead ([Jira Cloud webhooks](https://developer.atlassian.com/cloud/jira/platform/webhooks/)).
- **What Compass offers.** Compass has no outbound webhook setting. Its custom and incoming webhooks carry events **into** Compass ([incoming webhooks](https://support.atlassian.com/compass/docs/create-and-use-incoming-webhooks/), [custom webhooks](https://developer.atlassian.com/cloud/compass/components/create-custom-webhooks/)). Code that reacts to Compass component events runs as a Forge app ([Forge Compass events](https://developer.atlassian.com/platform/forge/events-reference/compass/)).

How Compass changes should reach Truehound after the import is an **owner decision**, and none of the options is built or verified. Examples: a Forge app that signs requests the way this route expects; changing the route to accept a signature an Atlassian sender can produce; or repeating Steps 1–4. Until then, the import in Steps 1–4 is a one-time snapshot.

To exercise the route by hand (for example from a script you control; this is **not** a Compass setting):

\`\`\`
# The route takes a tenant bearer token AND a hex HMAC-SHA256 of the exact
# request body in x-atlassian-webhook-identifier, keyed with
# ATLAS_WEBHOOK_SECRET_COMPASS (bff/src/auth-webhook.js). With no secret
# configured, every delivery gets 401 unless ATLAS_DEMO_MODE=1.
SIG=$(openssl dgst -sha256 -hmac "$ATLAS_WEBHOOK_SECRET_COMPASS" -hex < compass-export.json | sed 's/^.* //')
curl -X POST https://your-bff.example.com/api/v1/webhooks/compass \\
  -H "authorization: Bearer $TENANT_TOKEN" \\
  -H "x-atlassian-webhook-identifier: $SIG" \\
  -H 'content-type: application/json' \\
  --data-binary @compass-export.json
\`\`\`

A request missing either header is rejected with 401. Truehound's \`ingestCompassEvent\` is idempotent on \`externalId\`, so a repeated delivery of the same component is safe.

## Step 7 — Decommission

Once Truehound is the source of truth (typically end-of-week-2):

1. Remove the Compass adapter from \`tenantConfig.integrations.enabled\`.
2. If the owner built a sender for the route in Step 6, turn it off.
3. Cancel the Compass subscription before 2026-12-31.

## Failure modes

### "compass-export returned 401 Unauthorized"
- Token expired or wrong scope. Compass requires read access to \`components\` + \`scorecards\`.
- Fix: regenerate the token with the right scopes; retry.

### "Detected: unknown" in the wizard
- The uploaded JSON doesn't match the REST or compass.yml shape Truehound knows.
- Fix: confirm you're using the CLI output (not a hand-massaged file). The CLI's output always detects as \`rest-json\`.

### Service count off by N
- Either the catalog has SERVICE-typed components with empty \`id\` / \`name\` (importer skips them), or the catalog has more LIBRARY / WEBSITE / OTHER than expected.
- Fix: review the **Skipped** card on the wizard — each entry names the reason.

### Dependency edges missing
- Edge target component wasn't in the export, or had no matching \`externalId\` after upsert.
- Fix: re-run \`compass-export\` to capture the full component graph in a single pass; re-upload. Edges resolve lazily.

### Scorecard rules all show as MANUAL
- The export shape uses an older Compass criterion type the static mapping doesn't cover.
- Fix: file an issue with a sample (redacted) criterion. The mapping table is small (\`src/integrations/importers/compass-scorecards.ts\` STATIC_MAPPING) and easy to extend.

## Related

- [\`docs/COMPASS_PARITY.md\`](../COMPASS_PARITY.md) — feature-by-feature parity matrix.
- [\`docs/COMPASS_MIGRATION_AUDIT.md\`](../COMPASS_MIGRATION_AUDIT.md) — Compass-EOS audit dossier (dates, public sources).
- [\`src/integrations/importers/compass.ts\`](../../src/integrations/importers/compass.ts) — component importer source.
- [\`src/integrations/importers/compass-scorecards.ts\`](../../src/integrations/importers/compass-scorecards.ts) — scorecard-rule importer source.
- [\`cli/lib/compass-export.js\`](../../cli/lib/compass-export.js) — CLI implementation.
`;export{e as default};