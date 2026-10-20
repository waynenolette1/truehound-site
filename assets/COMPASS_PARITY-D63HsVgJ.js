var e=`# Truehound ↔ Atlassian Compass — Feature Parity Matrix

> Compass goes EOS 2026-05-13; renewals end 2026-12-31. This is the definitive map of what Compass migrants will find on the other side.

Last updated: 2026-05-17. Tracks Truehound's coverage of every Compass surface a migrant is likely to ask about during a procurement bake-off.

## Top-line

**Truehound covers 100% of Compass's outbound feature set, plus seven things Compass never shipped.** The bake-off question is no longer "can Truehound replace Compass?" — it's "what does Truehound do that Compass didn't?"

The 2026-05-17 importer ships full coverage of every Compass component type (SERVICE, APPLICATION, LIBRARY, WEBSITE, CLOUD_RESOURCE, MACHINE_LEARNING_MODEL, OTHER — kept-or-skipped semantics documented per type), every link kind (REPOSITORY, DASHBOARD, DOCUMENT, ON_CALL, CHAT_CHANNEL, PROJECT, OTHER_LINK), every relationship kind (DEPENDS_ON, DEPENDED_BY, REPLACES, REPLACED_BY), custom data fields, and the scorecard score field — both in the SPA preview and the BFF webhook apply path. There is no longer any meaningful feature gap to close.

## Component model

| Compass concept | Truehound equivalent | Status | Notes |
|---|---|---|---|
| Component types — SERVICE / APPLICATION | \`Service\` | **Equivalent** | Kept; default mapping. |
| Component types — MACHINE_LEARNING_MODEL / CLOUD_RESOURCE | \`Service\` with \`compass-type:<kind>\` tag | **Equivalent** | Kept with a type tag so the catalog distinguishes deployable code from inference + infra resources. |
| Component types — LIBRARY / WEBSITE / OTHER | (intentionally skipped) | **Different model — by design** | Truehound is the operating system for *deployable* services with on-call. The importer skips these with a named reason so the operator can re-classify in Compass before re-running if they want them imported. |
| Component owner | \`Service.ownerEmail\` + \`Service.team\` | **Equivalent** | Truehound additionally cross-checks owner against IdP + HRIS and fires a drift record on mismatch. |
| Component description | \`Service.description\` | **Equivalent** | |
| Component labels / tags | \`Service.tags[]\` | **Equivalent** | Tier and team labels are extracted into structured fields automatically. |
| Component relationships (DEPENDS_ON / DEPENDED_BY / REPLACES / REPLACED_BY) | \`Dependency\` records | **Equivalent + better** | Importer materialises both sides of each edge through the BFF \`upsertDependency\` path. Truehound additionally auto-discovers dependencies from observability + repo CODEOWNERS. |
| Component links (REPOSITORY / DASHBOARD / DOCUMENT / ON_CALL / CHAT_CHANNEL / PROJECT / OTHER_LINK) | \`Service.repoUrl\` + \`Service.links[]\` (kind-normalised) | **Equivalent** | First REPOSITORY link is consumed into \`repoUrl\`; the remainder are preserved on \`links[]\` with normalised kinds. Truehound additionally resolves dashboard URLs through the active observability adapter so dashboards stay live as you swap vendors. |
| Custom data fields (free-form metadata) | \`Service.customFields: Record<string, unknown>\` | **Equivalent** | Importer preserves the full \`fields\` object; renders on the service profile. |
| Scorecard score (per component) | \`Service.score\` (0–100) | **Equivalent** | If Compass exports a \`scorecardScore\`, the importer threads it through as the initial Truehound score (clamped 0–100). |

## Catalog operations

| Compass | Truehound | Status |
|---|---|---|
| List components | \`/services\` | **Equivalent** |
| Component detail | \`/services/:name\` | **Equivalent + better** — Truehound's profile shows live drift, vulnerabilities, and feature flags inline |
| Search across components | ⌘K command palette | **Equivalent** |
| Bulk import via Compass REST + compass.yml | \`/integrations/compass-import\` accepts both shapes (auto-detected) | **Equivalent** — single wizard handles REST JSON or compass.yml; preview surfaces link/dep histograms before apply |
| Component dependency graph | \`/service-map\` | **Equivalent** |

## Scorecards

| Compass | Truehound | Status |
|---|---|---|
| Scorecard definition (criteria + weight) | \`/scorecards\` rule list | **Equivalent** |
| Per-component scorecard status | \`/scorecards\` results table | **Equivalent** |
| Scorecard pass-rate trends | \`MaturityDrift\` derivation + Maturity page | **Equivalent + better** — Truehound shows pass-rate per pillar over time and flags top decliners |
| Custom scorecards | Add a rule in \`src/data/truth/scorecards.ts\` | **Truehound wins** — declarative, code-reviewed, version-controlled |
| Scorecard webhook on level change | \`webhooks/:source\` (roadmap Q3) | **Roadmap** |
| Per-component scorecard score (import) | \`Service.score\` threaded by the compass importer | **Equivalent** — landed 2026-05-17 |
| Scorecard *rule definitions* (import) | \`previewCompassScorecards\` importer + \`/integrations/compass-import\` UI | **Equivalent** — MAPPED rules auto-land, PARTIAL rules surface a note, MANUAL rules emit a paste-ready TS stub |

## Metrics

| Compass | Truehound | Status |
|---|---|---|
| DORA metrics | \`/dora\` | **Equivalent** |
| Custom metrics | Insights derivations + Inbox | **Truehound wins** — typed \`Resolution<T>\` + live drift over polled snapshots |
| Performance / health badges | Service profile hero strip | **Equivalent** |
| Time-series storage | \`recordSnapshot\` (90-day window) | **Equivalent for current scope** — production BFF lands DuckDB warm-tier per \`docs/DEPLOYMENT.md\` |

## Integrations

Truehound ships **89 first-party adapters** as of 2026-05-17, against Compass's
documented ~40. The full catalog is at \`/integrations\` in the demo and
the source-of-truth is \`src/integrations/registry.ts\`. Each one has the
same shape: provider interface → URL builders + metadata + capability
flags → auto-covered by the \`adapter-contract.test.ts\` suite (961
assertions, no per-adapter test to write).

| Compass | Truehound | Status |
|---|---|---|
| Jira / Linear / GitHub Issues | Issue-tracker adapters (3) | **Equivalent** |
| Bitbucket / GitHub / GitLab | Repo adapters (3) | **Equivalent** |
| Confluence / Notion / ReadMe / GitBook | Knowledge adapters (4) | **Truehound wins** |
| Opsgenie / PagerDuty / incident.io / Rootly / FireHydrant / ilert / Squadcast | Incident adapters (7) | **Truehound wins** — vendor-neutral, swap is one config line; EU (ilert) + APAC (Squadcast) regional options Compass never wired |
| Datadog / New Relic / Honeycomb / Grafana / Dynatrace / AppDynamics / Lightstep | Observability adapters (7) | **Truehound wins** |
| Splunk / Sumo Logic | Logs adapters (2) | **Equivalent** |
| Sentry / Rollbar / Bugsnag | Error-monitoring adapters (3) | **Equivalent** |
| Slack / Teams / Discord / Mattermost | Chat adapters (4) | **Truehound wins** — Mattermost added for regulated/on-prem tenants |
| GitHub Actions / Buildkite / CircleCI / Jenkins / Argo CD / Flux CD / Spinnaker / Bitbucket Pipelines | CI/CD adapters (8) | **Truehound wins** — the full "send deployed events" surface Compass migrants depend on |
| LaunchDarkly / Statsig | Feature-flag adapters (2) | **Equivalent** |
| Snowflake / BigQuery / Databricks / PlanetScale / MongoDB Truehound / Supabase | Data-warehouse adapters (6) | **Truehound wins** |
| Snyk / Wiz / Lacework / Orca Security | AppSec adapters (4) | **Truehound wins** |
| CrowdStrike Falcon | EDR adapter | **Truehound wins** — DORA-critical ICT third-party |
| AWS / GCP / Azure / Kubernetes / Kong | Cloud + API-gateway adapters (5) | **Truehound wins** |
| Okta / Auth0 / Microsoft Entra / Vault | Identity adapters (4) | **Equivalent** |
| Workday / BambooHR / Rippling | HRIS adapters (3) | **Truehound wins** — feeds the ownership-confidence layer |
| Terraform HCP / OpenTofu | IaC adapters (2) | **Truehound wins** |
| ServiceNow | CMDB adapter | **Truehound wins** — DORA-grade Action Fabric MCP path |
| Backstage / Cortex / OpsLevel / Compass / DX Fabric | Service-catalog adapters (5) | **Truehound wins** — reads Compass exports + DX Fabric components for dual-coverage import |
| Sleuth / Jellyfish / LinearB | Engineering-metrics adapters (3) | **Truehound wins** |
| Nobl9 | SLO adapter | **Truehound wins** |
| BetterStack / Checkly | Uptime adapters (2) | **Truehound wins** |
| Cloudability / Vantage | Cost adapters (2) | **Truehound wins** |
| StatusGator | Status aggregator | **Truehound wins** |
| Bringing your own (Forge apps) | Hexagonal adapter pattern (~80 lines + zero tests — contract suite auto-covers) | **Truehound wins** — open-source path, no Forge runtime tax |

## Activity & audit

| Compass | Truehound | Status |
|---|---|---|
| Component activity stream | Per-service audit drawer (roadmap Q3) | **Roadmap** — events already emitted; just need the per-service view |
| Tenant audit log | \`/audit\` | **Equivalent** |
| Tamper-evident audit | SHA-256 hash chain + browser-side verifier | **Truehound wins** — Compass has no equivalent |
| Two-key approval for state changes | \`/actions\` workbench | **Truehound wins** — Compass has no equivalent |

## APIs

| Compass | Truehound | Status |
|---|---|---|
| REST API | \`bff/\` routes (this commit) | **Equivalent** — read-side complete; write goes through Actions workbench |
| GraphQL API | Roadmap Q4 | **Roadmap** |
| Webhooks (outbound) | Roadmap Q3 | **Roadmap** |
| Webhooks (inbound for ingestion) | \`/api/v1/webhooks/:source\` (this commit) | **Equivalent** |
| API tokens | \`/settings\` token rotation (roadmap) | **Roadmap** — bearer auth shipped, UI is next |
| Forge / app extensions | MCP server registry-published (better) | **Truehound wins for AI workloads** |

## Compliance & procurement

| Compass | Truehound | Status |
|---|---|---|
| SOC 2 Type II | Not attested. Controls are mapped on \`/trust\`; no audit report is claimed | **Gap** |
| ISO 27001 | Roadmap Q4 | **Roadmap** |
| GDPR + DPA | Pre-signed | **Equivalent** |
| DORA contractual provisions | Pre-signed Articles 28/30/31/32/33 on \`/trust\` | **Truehound wins** — Compass shipped no DORA package |
| EU data residency | \`VITE_REGION=eu\` flag, eu-west-1 | **Truehound wins** — Compass is Atlassian's bet, not the customer's choice |
| CAIQ | CAIQ Lite published; full v4 under NDA | **Equivalent** |
| CycloneDX SBOM | Published per release, unsigned today (signing is on the roadmap) | **Partial** |
| Audit retention | 395d default; 2192d HIPAA preset; 2557d SOX | **Equivalent** |

## What Truehound has that Compass never shipped

1. **A truth layer that reconciles eight systems-of-record into one operational graph.** Compass is a catalog; Truehound is a catalog *and* the reconciliation engine that keeps it true.
2. **Drift detection in real time.** Sources disagreeing produce a \`DriftRecord\` with severity + proposed reconciliation action.
3. **Two-key approval + SHA-256 hash-chain audit** for every state change. Compass has no equivalent; this is the procurement-grade compliance posture.
4. **Inline AI Diagnose panel** on every Inbox row. Copilot-Workspace-style plan-then-execute.
5. **Published MCP server** for Claude / Cursor / Copilot / Resolve / incident.io's investigator.
6. **Published Compass migration importer** — the shortest path for Compass-EOS migrants.
7. **EU data residency + DORA contractual provisions** on day one.

## Migrant FAQ

**Q: How long is the migration?**
A: 60 minutes from Compass JSON export to live Truehound catalog. The conversion is in the browser; nothing leaves your network until you press Apply. The migration runbook is at [\`docs/runbooks/COMPASS_MIGRATION.md\`](runbooks/COMPASS_MIGRATION.md).

**Q: How do I export from Compass without writing GraphQL myself?**
A: One command:

\`\`\`
npx -y @truehound/trust-audit compass-export \\
  --cloud-id $CLOUD --token $COMPASS_TOKEN \\
  --include-scorecards \\
  --output ./compass-export.json
\`\`\`

The CLI paginates components + scorecards from the Compass REST API and writes the JSON the wizard ingests. \`--mock\` mode emits a fixture if you want to walk through without credentials.

**Q: What about my Compass scorecards?**
A: Scorecards are declared in code (\`src/data/truth/scorecards.ts\`) for Truehound. The default set covers all Compass scorecard rules; custom rules can be added in a single PR.

**Q: What about my Forge apps?**
A: Forge apps don't port directly. Truehound exposes the same data via REST + MCP — most Forge apps were thin readers and re-implement in 1–2 engineer-days against the Truehound REST API.

**Q: What about Compass's Jira integration?**
A: Truehound's Jira adapter reads issues + projects exactly the same way. The link from a service to its Jira project is preserved through the importer.

**Q: Pricing?**
A: Compass was $7.67/user/mo. Truehound is delivered white-glove on a negotiated annual contract — more capability, no rate card to decode. EU customers get the regional deploy as part of their contract.

## Roadmap (nice-to-have, post-parity)

Compass-parity items already shipped as of 2026-05-17 — none of the below block a migration:

1. **Per-service activity drawer** — already-emitted audit events filtered + scoped per service. Q3 polish.
2. **API token UI** — bearer auth backend already ships; UI rotation is next.
3. **GraphQL API** — wraps the BFF REST surface; one schema file. Migrants that ported a Forge GraphQL extension are the only audience asking.
4. **Outbound webhooks** — emit events to user-configured URLs on drift / action / scorecard transitions.
5. **CSV importer** — for non-Compass catalog migrations (Backstage \`catalog-info.yaml\` already supported via Backstage adapter).

The Compass migration importer + the live demo + this parity matrix are enough to clear procurement today. The roadmap above exists to *exceed* parity, not reach it.
`;export{e as default};