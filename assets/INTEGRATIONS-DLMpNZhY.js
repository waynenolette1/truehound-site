var e=`# Integrations

> Truehound is a control plane. The control plane is only as good as the systems it drives. The integration architecture is the contract that lets Truehound drive *any* tenant's stack.

> **Connecting a specific vendor?** See the per-vendor setup guides in
> [integrations/](integrations/README.md) — one walkthrough per major vendor
> (Datadog, PagerDuty, GitHub, Slack, Jira, Grafana, Opsgenie, ServiceNow)
> with the real console paths, minimum read-only scopes, and troubleshooting.
> This page is the *architecture*; those guides are the *how-to*.

## The pattern (hexagonal architecture)

\`\`\`mermaid
graph TB
  Pages["Pages (src/pages/)"]
  Reg["registry.active(category, enabled)"]
  Port["Provider interface (port)<br/>e.g. ObservabilityProvider"]
  Adapter["Concrete adapter<br/>e.g. datadogAdapter"]
  Vendor["Vendor system<br/>(Datadog, PagerDuty, …)"]

  Pages -->|never imports vendor SDKs| Reg
  Reg -->|resolves at runtime| Port
  Port -->|implemented by| Adapter
  Adapter -->|builds URLs / API calls| Vendor

  classDef contract fill:#dbeafe,stroke:#1e40af
  classDef impl fill:#dcfce7,stroke:#166534
  class Reg,Port contract
  class Adapter,Vendor impl
\`\`\`

Pages never know which adapter is active. They ask the registry for the active provider in a category and use the resulting interface methods.

## Categories shipped today

| Category | Adapters | Use cases |
|---|---|---|
| \`service-catalog\` | Backstage · Compass · Cortex · OpsLevel · DX Fabric | Catalog of record Truehound reconciles against |
| \`observability\` | Datadog · New Relic · Honeycomb · Grafana · Dynatrace · AppDynamics · Lightstep | Service dashboards, monitor URLs, metrics |
| \`incident\` | PagerDuty · Opsgenie · incident.io · Rootly · FireHydrant · ilert · Squadcast | Incident pages, schedules, ack flow |
| \`alerting\` | Alertmanager | Alert routing, webhooks |
| \`issue-tracker\` | Jira · Linear · GitHub Issues | Tickets and triage |
| \`chat\` | Slack · MS Teams · Discord · Mattermost | Bridge channels, mentions |
| \`repo\` | GitHub · GitLab · Bitbucket | Repo / PR / file links, CODEOWNERS |
| \`calendar\` | Google Calendar | Maintenance / change windows |
| \`secrets\` | HashiCorp Vault | Secret view links |
| \`sso\` | Okta · Auth0 · Microsoft Entra | Sign-in flows, group reads |
| \`knowledge\` | Confluence · Notion · ReadMe · GitBook | Doc / search links, staleness |
| \`cost\` | Cloudability · Vantage | FinOps dashboards, spend |
| \`billing\` | Cloudability · Vantage | Cloud-billing spend by tag |
| \`cloud\` | AWS · GCP · Azure · Kubernetes · Kong Konnect | Resource console links, spend, API gateway |
| \`data-warehouse\` | Snowflake · BigQuery · Databricks · PlanetScale · MongoDB Truehound · Supabase | Saved-query links |
| \`feature-flags\` | LaunchDarkly · Statsig | Flag definitions, rollouts |
| \`support\` | Zendesk · Intercom | Customer ticket links, write-back |
| \`hris\` | Workday · BambooHR · Rippling | Org chart, who-works-here |
| \`appsec\` | Snyk · Wiz · Lacework · Orca Security | Vulnerability findings |
| \`status-aggregator\` | StatusGator | Third-party vendor status |
| \`slo\` | Nobl9 | SLO definitions, burn rate |
| \`uptime\` | Better Stack · Checkly | Synthetic / uptime checks |
| \`ci-cd\` | GitHub Actions · Buildkite · Azure DevOps · CircleCI · Jenkins · Argo CD · Flux CD · Spinnaker · Bitbucket Pipelines | Pipeline run health |
| \`engineering-metrics\` | LinearB · Jellyfish · Sleuth | DORA / lead-time series |
| \`logs\` | Splunk · Sumo Logic | Log search |
| \`error-monitoring\` | Sentry · Rollbar · BugSnag | Captured-exception triage |
| \`edr\` | CrowdStrike Falcon | Endpoint detections |
| \`iac\` | OpenTofu · HCP Terraform | Terraform state / run inspection |
| \`cmdb\` | ServiceNow | CI relationships, change requests |

90 adapters across 29 categories. The catalog is browsable on the **Integrations** page in the running app — each card shows the reads its vendor client supports — and \`src/integrations/registry.test.ts\` walks every adapter to assert id uniqueness, glyph format, category coverage, and resolver correctness.

## How a page uses an integration

\`\`\`ts
import { registry } from "@/integrations/registry";
import { tenantConfig } from "@/tenant/tenant.config";
import type { ObservabilityProvider } from "@/integrations/types";

const obs = registry.active<ObservabilityProvider>(
  "observability",
  tenantConfig.integrations.enabled,
);

if (obs) {
  const url = obs.serviceDashboardUrl(service.name);
  // … render link
}
\`\`\`

Pages always check \`if (obs)\` because a tenant might not have an observability adapter enabled. Don't assume — guard.

## ShareMenu — the higher-level API

For the very common "share this finding" UX, use the \`<ShareMenu>\` component. It reads the tenant's enabled list and surfaces the right destinations automatically:

\`\`\`tsx
import { ShareMenu } from "@/components/ShareMenu";

<ShareMenu
  subject={{
    kind: "incident",
    title: \`\${incident.severity}: \${incident.title}\`,
    body: \`\${incident.serviceName} · \${duration} · responder @\${incident.responder}\`,
  }}
/>
\`\`\`

Resulting menu offers, depending on what's enabled:

- *Open in Jira* (or Linear / GitHub Issues — whichever issue tracker the tenant enabled first)
- *Post to Slack* (or Teams / Discord)
- *Search Confluence* (or Notion)
- Copy link, copy summary + link, email

The component handles clipboard, toasts, and analytics; pages just supply the subject.

## Adding a new adapter

1. Add the adapter to \`src/integrations/adapters/\`. A standalone
   \`<vendor>.ts\` works, but the established convention is to group adapters
   by category into the existing batch files (\`observability.ts\`,
   \`incident.ts\`, \`chat.ts\`, \`extended.ts\`, \`compass-parity-batch.ts\`, …).
   Add yours to the matching batch file and export it from there.

2. Export a constant typed as the relevant provider interface:

   \`\`\`ts
   import type { IncidentProvider } from "../types";

   export const myVendorAdapter: IncidentProvider = {
     metadata: {
       id: "my-vendor",                    // kebab-case, unique
       displayName: "My Vendor",
       category: "incident",
       tagline: "One-line marketing tagline.",
       glyph: "MV",                        // 2-letter fallback
       docsUrl: "https://docs.myvendor.com",
       configFields: [
         { key: "MV_API_TOKEN", label: "API token", required: true, secret: true },
       ],
     },
     // URL builders MUST encode their input — \`adapter-contract.test.ts\`
     // asserts every id round-trips and that "/" in an id is escaped.
     // Bare \`\${id}\` fails the contract suite; always wrap in encodeURIComponent.
     incidentUrl: (id) => \`https://app.myvendor.example/incidents/\${encodeURIComponent(id)}\`,
     schedulePageUrl: (id) => \`https://app.myvendor.example/schedules/\${encodeURIComponent(id)}\`,
     acknowledgeUrl: (id) => \`https://app.myvendor.example/incidents/\${encodeURIComponent(id)}/ack\`,
   };
   \`\`\`

   ### Contract requirements (enforced by \`adapter-contract.test.ts\`)

   Every adapter ships a **complete, validated contract** so a customer
   can plug in real credentials later with no half-defined stubs. The
   metadata fields below are no longer optional:

   - **\`configFields\`** — required and non-empty. Declare *every*
     credential/config value the adapter needs (API key, host, workspace
     id, …). Each field is \`{ key, label, required, secret?, placeholder?, type? }\`:
     - \`key\` follows the env-var convention \`^[A-Z][A-Z0-9_]*$\`.
     - Mark any field whose key ends in \`KEY\`/\`TOKEN\`/\`SECRET\`/\`PASSWORD\`
       as \`secret: true\` (the UI masks it; logs redact it).
     - Set \`type: "url"\` for fields that must hold an http(s) URL. Keys
       ending in \`_URL\` or \`_ADDR\` are inferred as URL fields
       automatically, so \`type\` is only needed for URL fields with an
       unconventional key (e.g. \`APPD_CONTROLLER\`).
   - **\`docsUrl\`** — required, \`https://\`, pointing at the vendor's
     real API/developer docs (the customer needs them to source the
     field values you're asking for).

   You do **not** write \`validateConfig\` or \`connectionTest\` by hand. The
   registry attaches both automatically (\`finalizeAdapter\` in
   \`src/integrations/contract.ts\`), derived from your \`configFields\`:

   - **\`validateConfig(config)\` → \`{ valid, errors }\`** — pure, no
     network. Checks required fields present + non-blank, url-typed
     fields parse as http(s), and rejects unknown keys.
   - **\`connectionTest()\` → \`{ supported, ok?, detail? }\`** — returns
     \`{ supported: false }\` for demo adapters (no BFF read path wired
     yet). The method exists so BFF wiring can drop in a real
     reachability probe later without touching any caller.

   Override either method on the adapter literal only if the vendor needs
   rules the metadata-driven default can't express (e.g. an account id
   that must match a regex) — \`finalizeAdapter\` fills in only what's
   missing.

3. Register the adapter in \`src/integrations/registry.ts\`:

   \`\`\`ts
   import { myVendorAdapter } from "./adapters/my-vendor";

   // Adapter literals go in RAW_PROVIDERS; the registry maps each
   // through finalizeAdapter() to attach the contract methods before
   // exposing them as ALL_PROVIDERS.
   const RAW_PROVIDERS = [
     // …
     myVendorAdapter,
   ];
   \`\`\`

4. The contract + registry tests automatically validate:
   - **\`registry.test.ts\`** — id format (kebab-case), id uniqueness,
     glyph length + uniqueness across distinct vendors, category
     coverage, the \`active()\` resolver.
   - **\`adapter-contract.test.ts\`** — \`docsUrl\` present + https,
     non-empty \`configFields\`, every required URL-builder method for the
     category, URL builders round-trip their input and encode \`/\`,
     \`validateConfig\` (fully-populated config passes; missing-required
     fails; non-URL in a url field fails), and \`connectionTest\` returns a
     well-formed result.

5. Enable it for tenants that should use it by adding the id to \`tenantConfig.integrations.enabled\` (or to the new tenant entry in \`tenants.ts\`).

## Adding a new category

1. Add the literal to \`IntegrationCategory\` in \`src/integrations/types.ts\`.

2. Define a new provider interface and add it to the \`BaseProvider\`
   union (the category-specific URL-builder ports). \`Provider\` is
   \`BaseProvider & AdapterContract\` — the contract is mixed in once, so
   you only extend \`BaseProvider\`:

   \`\`\`ts
   export interface MyCategoryProvider {
     metadata: AdapterMetadata & { category: "my-category" };
     somethingUrl(id: string): string;
   }

   export type BaseProvider =
     | ObservabilityProvider
     | IncidentProvider
     // …
     | MyCategoryProvider;
   \`\`\`

3. Add a label to \`CATEGORY_LABEL\` and an entry to \`ALL_CATEGORIES\` in \`registry.ts\`.

4. Ship at least one mock adapter so the demo covers the category. The registry tests will fail otherwise.

## Multi-tenant deploys

\`src/tenant/tenant.config.ts\` is one tenant. Multi-tenant works like this:

- Add additional configs to \`KNOWN_TENANTS\` in \`src/tenant/tenants.ts\`.
- Set \`VITE_TENANT_ID=<id>\` at build time.
- Ship one CI workflow per tenant, each with its own GitHub repo secrets (demo creds + integration tokens).

The shape of every tenant config is identical, so the entire app keeps working.

\`\`\`ts
// src/tenant/tenants.ts
const KNOWN_TENANTS: Record<string, TenantConfig> = {
  "atlas-demo": atlasDemo,
  "acme-corp": acmeCorp,        // your tenant
  "beta-industries": betaInd,   // another tenant
};
\`\`\`

## Per-tenant integration enablement

\`tenantConfig.integrations.enabled\` is an **ordered** list. The registry's \`active()\` method returns the first enabled adapter that matches a category.

\`\`\`ts
// Tenant A — wants PagerDuty primary, Opsgenie as a fallback option
enabled: ["pagerduty", "opsgenie", "datadog", "jira", "slack", ...]

// Tenant B — Opsgenie only
enabled: ["opsgenie", "newrelic", "linear", "msteams", ...]
\`\`\`

Tenant A gets PagerDuty as the active incident provider. Remove \`"pagerduty"\` from the list and Opsgenie takes over. No other code changes.

## Reading data — the vendor-client layer

Adapters answer *where* a thing lives (URL builders). The **vendor-client
layer** answers *what Truehound can read out of the vendor*. It is split so the
SPA stays standalone:

\`\`\`mermaid
graph LR
  Adapter["Adapter metadata<br/>(capabilities)"]
  Mock["Mock VendorClient<br/>src/integrations/clients/"]
  Real["Real VendorClient<br/>bff/src/vendors/"]
  SPA["SPA (Integrations page)"]
  BFF["BFF (drift detector, /api/v1/vendors)"]

  Adapter -->|capability-gated| Mock
  Adapter -->|capability-gated| Real
  Mock --> SPA
  Real --> BFF

  classDef a fill:#dbeafe,stroke:#1e40af
  classDef b fill:#dcfce7,stroke:#166534
  class Mock,Real a
  class SPA,BFF b
\`\`\`

**One contract, two implementations.** \`VendorClient\`
(\`src/integrations/clients/types.ts\`) declares one optional read method per
\`AdapterCapabilities\` flag (\`listMonitors\`, \`listIncidents\`,
\`listVulnerabilities\`, \`spendByTag\` → \`listSpend\`, …). A client only exposes
the methods its adapter's capabilities — or the category default — advertise.

- **Mock** (\`src/integrations/clients/\`): \`createMockVendorClient(meta)\`
  returns deterministic, vendor-id-seeded fixtures. No network, no SDKs — this
  is the only client the SPA imports. The Integrations page renders each
  adapter's reads via \`capabilityLabelsFor(id)\`.
- **Real** (\`bff/src/vendors/\`): a config-driven \`createVendorClient(spec)\`.
  A \`VendorSpec\` declares \`baseUrl(env)\`, \`auth(env)\`, \`requiredEnv\`, and
  \`endpoints\` (path + \`map\` per capability). The generic \`fetch\` client
  applies auth, calls the vendor, and normalises the response. A vendor is a
  config object, not a bespoke file. The BFF exposes the catalog read-only at
  \`GET /api/v1/vendors\`.

Link-only vendors (Vault, Snowflake, BigQuery, Databricks, Compass, OpenTofu)
carry empty capability/endpoint maps — there's nothing the truth layer pulls
from them.

### Where the real client is consumed — drift reconciliation

The BFF drift detector (\`bff/src/drift-detector.js\`) runs **vendor-backed
rules** alongside its intrinsic ones. A vendor rule declares
\`vendor: { category, read }\`; \`detectDriftForTenant\` resolves the tenant's
connected clients with \`resolveTenantVendorClients(env, enabledIds)\`,
pre-fetches each read once (sharing a 60s cache), and reconciles the catalog
against live data. Six vendor-backed rules today:

- \`ownership.unverified\` — owner \`ownerEmail\` isn't an active HRIS employee
- \`monitor.coverage\` — no monitor in the observability provider
- \`vulnerability.critical_open\` — an open critical / known-exploited finding
  in the appsec scanner
- \`schedule.gap\` — the owning team's on-call schedule has uncovered hours
- \`iac.untracked\` — the service has no Terraform workspace
- \`cmdb.unregistered\` — the service has no CMDB Configuration Item

A failing vendor read is recorded in the reconcile summary's \`vendorErrors\`
— a broken sync never looks like "no drift."

### Which vendors are "enabled" — two lists, one source

There are two enabled-vendor lists, by design, because the SPA and the BFF
are separate deployables:

- **SPA** — \`tenantConfig.integrations.enabled\` (\`src/tenant/\`). Drives the
  Integrations page, \`ShareMenu\`, and which mock client a page resolves.
- **BFF** — the \`ATLAS_VENDORS\` env var (comma-separated adapter ids).
  Drives \`resolveTenantVendorClients\` and therefore which vendor-backed
  drift rules can fire.

\`ATLAS_VENDORS\` is the BFF-side mirror of the SPA list and must be kept in
sync — a deploy pipeline should derive one from the other (the per-tenant CI
workflow is the natural place). When no vendor is connected (demo mode, no
secrets) vendor rules simply don't fire — the standalone demo is unaffected.

### Adding reads to a vendor

1. Set the capability flag in the adapter's \`metadata.capabilities\`.
2. In the matching \`bff/src/vendors/specs/<cluster>.js\` spec, add an
   \`endpoints.<method>\` entry: \`path\`, optional \`query\`/\`body\`/\`method\`, and a
   \`map(json, env, ...args)\` that returns the vendor-neutral shape.
3. The mock client picks the capability up automatically.

Don't call vendor APIs directly from the frontend — that's what the BFF is
for, and the cache benefits disappear if you bypass it.

## Trade-offs we made

| Decision | Why | What we gave up |
|---|---|---|
| First-match resolution per category | Simple mental model, fast O(n) | Can't load-balance between two adapters in the same category |
| Provider per-category, not per-vendor | Pages need a stable contract, not a vendor map | Vendor-specific features have to be expressed via the generic interface |
| URL-builder-only adapters today | No backend means no API calls | Limited richness of integration; deepens with the BFF |
| Adapter ids are kebab-case strings | Stable across releases, JSON-friendly | Slight friction picking a name |

These are documented as ADRs (\`docs/adr/0004-hexagonal-integrations.md\`) so future you can disagree with past you in writing.

## Onboarding a new tenant — checklist

1. Clone Truehound, set \`VITE_TENANT_ID=acme\`.
2. Add \`acme\` to \`KNOWN_TENANTS\` in \`src/tenant/tenants.ts\` with brand, theme, demo credentials, and the \`integrations.enabled\` list.
3. Set the required adapter secrets in the deploy environment (e.g. \`DD_API_KEY\`, \`PAGERDUTY_TOKEN\`, etc. — see each adapter's \`configFields\`).
4. Push to main; the deploy workflow injects secrets at build time and publishes.

That's the entire onboarding ritual.

## Reference

- Provider interfaces: \`src/integrations/types.ts\`
- Registry: \`src/integrations/registry.ts\`
- Adapters: \`src/integrations/adapters/*.ts\`
- Vendor-client contract: \`src/integrations/clients/types.ts\`
- Mock vendor client: \`src/integrations/clients/mock.ts\`
- Real vendor client (BFF): \`bff/src/vendors/client.js\` + \`bff/src/vendors/specs/*.js\`
- Tenant config: \`src/tenant/tenant.config.ts\`
- Multi-tenant registry: \`src/tenant/tenants.ts\`
- ShareMenu: \`src/components/ShareMenu.tsx\`
- Tests: \`src/integrations/registry.test.ts\`, \`src/integrations/clients/mock.test.ts\`, \`bff/src/vendors/vendors.test.js\`
- See also: [EXTENSIBILITY.md](EXTENSIBILITY.md) for the full add-an-adapter walkthrough.
`;export{e as default};