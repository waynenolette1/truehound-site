var e=`# Tenant configuration UX — research brief (2026 Q2)

> Status: v33 leg 5 research deliverable. Inputs to v34+ tenant-config surface
> work. Not a spec — this is a survey of how peer products solve the same
> problem so Truehound can pick patterns deliberately rather than re-inventing.

## 1. Executive summary

Across LaunchDarkly, Vercel, Cloudflare Workers, Datadog, Frontegg, Auth0,
and Configcat the dominant 2026 tenant-config pattern is **stratified
hierarchy + inline diff review + immutable audit + selectively gated
approvals** — global → tenant → environment → branch/team, with the UI
making the "which layer am I editing?" question impossible to confuse.
Truehound should adopt three pieces wholesale: (a) the **request-approve-apply**
three-step approval flow LaunchDarkly pioneered (it maps cleanly onto our
existing two-key gate rail), (b) Vercel's **environment-scope chips on every
field** so the layer is always visible, and (c) Datadog's **structured
JSON diff with green/red highlighting** for audit and review. Truehound should
*avoid* exposing the full config schema as one flat form (Cloudflare's
weakest area) and should not build a per-field free-text editor for values
that have a closed enum (the most common cause of broken tenants in
Configcat reviews).

## 2. Pattern catalog

### 2.1 Stratified config hierarchy with explicit scope chips

**Description.** Every config field belongs to a named layer (org / tenant /
environment / branch / team / user). The UI shows the layer next to the
field, and overrides at a narrower layer mask the broader value. This is
what makes large config surfaces navigable — you can answer "where does
this value come from?" without grepping.

**Examples.**
- **Vercel** lets every env var be scoped to Production, Preview, Custom
  environments, or Development, with **branch-specific Preview vars that
  override the catch-all Preview value**. The dashboard renders one row per
  variable with environment chips on the right; branch-scoped overrides
  appear as nested rows under the parent. ([Vercel docs](https://vercel.com/docs/environment-variables),
  [branch-scoped env vars changelog](https://vercel.com/changelog/environments-variables-per-git-branch))
- **LaunchDarkly** uses a project → environment → flag hierarchy. A flag's
  variation values live in the project, but its on/off and targeting state
  live per environment, with **prerequisite flags** acting as cross-flag
  dependencies. ([Flag hierarchy](https://launchdarkly.com/docs/guides/flags/flag-hierarchy/))
- **Datadog Organization Settings** groups config into four top-level
  buckets (Identity & Accounts, Authentication, Access, Security &
  Compliance) and scopes most write surfaces through Teams. ([Org settings](https://docs.datadoghq.com/account_management/org_settings/))

**Fits Truehound when** we add per-environment or per-team overrides beyond
\`loopSli.perTeam\` (the only stratified slice we have today). The pattern
forces us to decide which layer owns each field before we ship the UI.

**Doesn't fit when** the field is genuinely tenant-wide (brand name,
primary color, compliance region) — adding fake layers there is noise.

### 2.2 Inline diff preview before commit

**Description.** Before a config change is saved, the user sees a
**before-vs-after diff** with added/removed lines highlighted. The diff is
the artifact that gets reviewed, not the form. JSON is the canonical
representation because it survives schema evolution and round-trips through
audit.

**Examples.**
- **Datadog Audit Trail** ships an "Inspect Changes (Diff)" tab that
  renders dashboard/notebook/monitor changes as JSON with **additions in
  green and removals in red**. The same diff drives both the live preview
  on save and the historical view from audit. ([Audit Trail](https://docs.datadoghq.com/account_management/audit_trail/))
- **LaunchDarkly** offers both a "Visual list" and a "JSON list" toggle on
  every approval request so reviewers can pick the representation that
  matches their cognitive style. ([Reviewing approval requests](https://docs.launchdarkly.com/home/releases/approval-reviews))
- **Microsoft Entra Tenant Configuration Management** uses human-readable
  JSON templates as the source of truth, with drift detection running
  continuously against the baseline. ([TCM overview](https://learn.microsoft.com/en-us/entra/id-governance/tenant-governance/overview))

**Fits Truehound** because the audit chain already stores changes as
discriminated-union events — we can render a diff from any two adjacent
events on the same resource without a new storage layer.

**Doesn't fit when** the change is purely additive and reversible
(toggling a flag on a non-prod tenant). Forcing a diff modal there is
ceremony for ceremony's sake.

### 2.3 Request → Approve → Apply (three-step approval)

**Description.** A config change moves through three independent
transitions: a user **requests** it (writing the proposed value), one or
more reviewers **approve** it (without applying), and finally someone
(the original requester, the reviewer, or an automation) **applies** it
to the live system. Separating Approve from Apply is critical — it lets
reviewers sign off in a quiet moment and apply during a deploy window.

**Examples.**
- **LaunchDarkly** explicitly separates Approve from Apply. The product
  page calls this out: "The separation of 'Approve' and 'Apply' was key to
  some of our customers, who would like to get their changes reviewed,
  but ultimately have control over when they get merged into Production."
  Reviewers can comment, request more info, approve, or decline.
  ([Approval requests](https://launchdarkly.com/docs/home/releases/approval-requests),
  [Approval reviews](https://docs.launchdarkly.com/home/releases/approval-reviews))
- **Frontegg's** admin portal exposes role/permission changes through a
  self-service flow, but defers approval to the tenant's own RBAC model
  rather than building a separate review surface — a deliberately
  lighter pattern that fits smaller tenants. ([Admin portal](https://frontegg.com/product/admin-portal))
- **Microsoft Entra TCM** requires multi-party approval (MPA) for
  critical policy changes and ties every change into a continuous-control
  drift detector. ([Tenant governance preview](https://blog.interian.be/2026/02/22/tenant-configuration-management-microsoft-moves-tenant-governance-into-continuous-control/))

**Fits Truehound** perfectly for high-blast-radius fields — loop SLI
thresholds, RBAC roles, accent color (yes, even the color, because a
broken brand color is a customer-visible incident). This maps 1:1 onto
the existing two-key gate rail (see \`docs/TWO_KEY_GATE.md\`).

**Doesn't fit** for personal preferences (theme, mobile-tab pins) or for
ephemeral tokens (API tokens, webhook subscriptions) where the right
revocation primitive is "revoke now" not "ask permission".

### 2.4 Immutable, queryable audit trail with structured fields

**Description.** Every config change writes one row: actor, timestamp,
resource id, action, before, after, source (UI/API/CLI), client IP. The
audit surface is searchable by every field. Natural-language search is
becoming table stakes.

**Examples.**
- **Datadog Audit Trail** captures actor (user email, API key id), HTTP
  method, resource context, change metadata, and supports **natural-language
  queries that translate into structured audit queries**. Users can export
  up to 100K events as CSV. ([Audit Trail](https://docs.datadoghq.com/account_management/audit_trail/),
  [Compliance launch post](https://www.datadoghq.com/blog/compliance-governance-transparency-with-datadog-audit-trail/))
- **LaunchDarkly's** approval surface ties each approval request to the
  underlying flag's history, so the audit log shows both the change and
  who reviewed it.
- **Vercel** logs every env-var change to the project's audit log; the
  values themselves are encrypted at rest but the change metadata is
  fully queryable. ([Vercel env docs, Feb 2026 update](https://vercel.com/docs/environment-variables))

**Fits Truehound** — we already have the audit chain (\`docs/AUDIT_DESIGN.md\`).
The gap is presenting it on a config-change surface rather than only on
action-execution surfaces. Inference: a \`/settings/audit\` view filtered
to \`kind:config.*\` events is a one-page change.

**Doesn't fit** if we silently mask the before-value (the original
"sensitive" value of a secret). For secrets, the audit row should record
the *fact of change* and not the secret value itself — Cloudflare's
approach. ([Secrets](https://developers.cloudflare.com/workers/configuration/secrets/))

### 2.5 Self-service vs. controlled fields

**Description.** Not every field a tenant admin sees is one they should
edit. The UI distinguishes **fully self-service** (toggle, save, done),
**self-service with approval** (request, wait, apply), and **read-only
for tenant admin, only Truehound can change** (e.g. compliance region, audit
retention floor).

**Examples.**
- **Frontegg** lets tenant admins fully self-serve users, roles, MFA, SSO,
  API tokens, and webhooks — the things that vary per tenant. Billing tier
  changes also self-serve via the Subscription module. ([Admin portal](https://frontegg.com/product/admin-portal))
- **Auth0 Organizations** lets the platform tenant configure the
  org-level shell (name, branding, connections) while the underlying
  Auth0 tenant config (region, compliance posture) is locked.
  ([Multi-org architecture](https://auth0.com/docs/get-started/architecture-scenarios/multiple-organization-architecture))
- **Datadog** uses RBAC permissions like "Audit Trail Write" to gate the
  enable/disable toggle on audit itself — a field most tenants can see
  but few can change.

**Fits Truehound.** Inference: every field in \`TenantConfig\` should be tagged
in code with one of \`{self-service, approval-required, atlas-only}\`.
Today the file is editable as TypeScript source, so the distinction is
implicit; in a tenant-config UI it becomes the most important piece of
metadata.

### 2.6 Search, filter, and progressive disclosure

**Description.** At thousands-of-fields scale, the config surface needs
search-first navigation. Configcat surfaces this through reorder + expand/
collapse on flag lists; Datadog through saved views; LaunchDarkly through
flag tags and natural-language search. The general 2026 admin-UX
principle is **progressive disclosure** — show common knobs, hide rare
ones behind "Advanced" until the user asks. ([B2B SaaS UX 2026](https://www.onething.design/post/b2b-saas-ux-design))

**Examples.**
- **Configcat** lets users **reorder, expand, collapse all** on flag lists
  and added dark mode in early 2025. ([Configcat dashboard update](https://configcat.com/blog/2025/01/30/whats-new-in-configcats-dashboard/))
- **LaunchDarkly** offers tag-based filtering and the right-sidebar
  "Pending changes" indicator surfaces queued requests without leaving
  the flag list.
- **Datadog** ships saved views with pre-built integration views for the
  audit explorer.

**Fits Truehound** when the surface grows beyond ~15 fields. Today the
\`/settings\` page has 7 cards — too small to need search. By v36+ it
will need it.

## 3. Recommended Truehound tenant-config surface

### 3.1 Information architecture

Split into two routes — \`/settings\` (per-user, what we already have) and
\`/settings/tenant\` (new, tenant-wide, admin-only via \`RequireRole\`).
\`/settings/tenant\` has these sections, left-nav ordered by frequency of
access:

| Section | Fields | Tier |
|---|---|---|
| **Brand** | product name, tagline, logo, primary color | approval-required |
| **Loop SLI** | tenant defaults + per-team thresholds | approval-required (two-key) |
| **Auth** | session TTL, demo user list, credential source | atlas-only (locked) |
| **Integrations** | enabled adapter ids + secrets | self-service |
| **Compliance** | region, audit retention, security contact | atlas-only (read-only) |
| **Webhooks** | outbound subscriptions | self-service (already shipped on \`/settings\`) |
| **API tokens** | per-tenant tokens | self-service (already shipped) |
| **Audit** | history filtered to \`config.*\` events | read-only |

The per-user \`/settings\` page stays as-is. Move outbound webhooks and API
tokens to \`/settings/tenant\` when they should be tenant-scoped rather than
user-scoped (today they're stored under \`atlas.subscriptions.v1\` /
\`atlas.api_tokens.v1\` in localStorage — already implicitly tenant-scoped).

### 3.2 Field-level UX

Every editable field follows the same pattern:

1. **Display row** — label, current value, scope chip (e.g. \`team:Payments\`
   or \`tenant\`), source pill (\`local\`, \`env\`, \`inherited\`), and an "Edit"
   affordance.
2. **Edit mode** — replaces the value with a typed input (text / number /
   enum select / color picker / JSON editor). **Validation is inline**:
   red helper text under the field when invalid, save button disabled
   until valid. No modals for validation feedback.
3. **Save flow** — opens a **diff preview drawer** showing before / after
   as JSON with green/red highlighting (the Datadog pattern). User
   confirms; for approval-required fields, "Save" becomes "Request
   approval".
4. **Approval state** — the field row gets a yellow \`Pending approval\`
   badge with reviewer initials. The second key approver lands on
   \`/settings/tenant?approve=<changeId>\` and sees the same diff drawer
   with Approve / Decline buttons.
5. **Apply** — once approved, the requester (or any tenant admin) clicks
   Apply on the diff drawer to commit. The change writes one
   \`config.applied\` event to the audit chain.

### 3.3 Approval flow (does loop SLI need two-key?)

**Yes.** Loop SLI thresholds drive \`TeamLoopSliChip\` rendering on every
team page; a wrong threshold turns a healthy team red overnight, which
is a customer-visible incident. The two-key gate already runs on
\`CorrectiveActionPanel\` (see commit \`96d1298\`) — reuse the same
\`PendingApproval\` primitive.

Approval-required fields (Brand, Loop SLI) all flow through:

\`\`\`
request → approve (different user, same role) → apply (any tenant admin)
\`\`\`

Truehound-only fields (Auth, Compliance) show a read-only row with a
"Contact your Truehound representative" affordance — no editing UI at all.
This is the Auth0 pattern for region/compliance posture.

## 4. What we already have — gap audit

Greppable today (\`grep -rn "tenantConfig\\|/settings" src/pages/\`):

| Surface | Path | What it does | Gap |
|---|---|---|---|
| **Per-user settings** | \`src/pages/Settings.tsx\` | Theme, mobile tabs, webhooks, API tokens, usage meter, demo-data info | No tenant-wide section. Webhooks/tokens conceptually belong on a tenant page. |
| **Admin overview** | \`src/pages/Admin.tsx\` | Read-only tenant-config viewer (\`ConfigSection\`) showing product / tagline / session TTL / demo users | Read-only. No edit surface. No diff preview. No approval flow. |
| **Tenant manifest** | \`src/tenant/tenant.config.ts\` | The actual config source — TypeScript file | No UI to edit it; changes require a code deploy. |
| **Loop SLI override** | \`src/tenant/loopSliConfig.ts\` + \`loopSliConfig.test.ts\` | Resolver + tests for per-team thresholds | Resolver exists; no UI ever to edit \`perTeam\`. Tests use \`vi.doMock\`. |
| **Integration enablement** | \`src/pages/Integrations.tsx\` | Renders the enabled-set as read-only chips | No toggle UI; enablement requires editing \`tenant.config.ts\`. |
| **Audit chain** | \`src/data/truth/*\`, \`useActionsAudit\` | Append-only event log already used by billing summary | No config-change events written yet; no \`/settings/audit\` view. |

**Biggest gap:** there is no edit surface anywhere. Every tenant-config
change today is a code deploy. That's fine for the demo and acceptable
for v33; it is **not** acceptable for the production multi-tenant story
described in \`docs/DEPLOYMENT.md\` and \`docs/PORTING.md\`.

**Second gap:** the audit chain doesn't yet emit \`config.*\` events. We
need a \`config.requested\` / \`config.approved\` / \`config.applied\` triplet
to mirror the action-* triplet.

## 5. Concrete next steps for v34+

| # | Item | Effort | Value |
|---|---|---|---|
| **1** | **Promote \`Admin.tsx\`'s \`ConfigSection\` into a \`/settings/tenant\` route**, gated by \`RequireRole="admin"\`. Render every \`TenantConfig\` field as a read-only row with a scope chip and source pill. No edit affordance yet — just the read surface that makes the schema discoverable. | S (1–2 days) | High. Unblocks every later step. Tenant admins can self-audit today. |
| **2** | **Extend the audit chain with \`config.requested\` / \`config.approved\` / \`config.applied\` events**, mirroring the \`action.*\` shape from \`src/data/truth/\`. Backfill the test fixtures so \`useActionsAudit\` returns them when surfaced on \`/settings/tenant\`. | M (3–5 days) | High. Makes every later edit auditable from day one. Required before we ship any edit UI. |
| **3** | **Build the diff-preview drawer primitive** (\`src/components/data/ConfigDiffDrawer.tsx\`). Inputs: before-JSON, after-JSON. Output: green/red JSON diff with line numbers. Reuse \`react-diff-view\` or write a thin wrapper around a token diff. | S (2 days) | High. Reusable for approvals, audit history, and (later) drift detection. |
| **4** | **Ship the \`loopSli.perTeam\` edit surface as the pilot.** It's the smallest editable field group, it already has a resolver + tests, and it benefits most from the two-key gate. Wire it to step 3's drawer and step 2's events; require two distinct admin approvers. | M (4–6 days) | Very high. Validates the whole approval rail with a real, opinionated field. |
| **5** | **Add a \`/settings/tenant/audit\` view** that filters the audit chain to \`config.*\` kinds, with structured columns (when, who, resource, action) and an expandable diff row. Reuse the existing \`useActionsAudit\` hook. | S (1–2 days) | Medium-high. Closes the loop — every change is reviewable forever, not just at request time. |

Total: ~3 weeks of focused work to go from "config is a TypeScript file"
to "config is a governed, audited, two-key-approved tenant surface."

## 6. References

- [LaunchDarkly — Flag hierarchy](https://launchdarkly.com/docs/guides/flags/flag-hierarchy/)
- [LaunchDarkly — Approval requests](https://launchdarkly.com/docs/home/releases/approval-requests)
- [LaunchDarkly — Reviewing approval requests](https://docs.launchdarkly.com/home/releases/approval-reviews)
- [LaunchDarkly — Approvals overview](https://launchdarkly.com/docs/home/releases/approvals)
- [LaunchDarkly — Announcing Feature Workflows](https://launchdarkly.com/blog/announcing-feature-workflows-in-launchdarkly/)
- [Vercel — Environment variables (Feb 2026)](https://vercel.com/docs/environment-variables)
- [Vercel — Branch-scoped env vars changelog](https://vercel.com/changelog/environments-variables-per-git-branch)
- [Vercel — Environment Variables UI blog](https://vercel.com/blog/environment-variables-ui)
- [Cloudflare Workers — Environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Cloudflare Workers — Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare Workers — KV bindings](https://developers.cloudflare.com/kv/get-started/)
- [Datadog — Organization Settings](https://docs.datadoghq.com/account_management/org_settings/)
- [Datadog — Audit Trail](https://docs.datadoghq.com/account_management/audit_trail/)
- [Datadog — Audit Trail launch blog](https://www.datadoghq.com/blog/compliance-governance-transparency-with-datadog-audit-trail/)
- [Frontegg — Admin Portal product page](https://frontegg.com/product/admin-portal)
- [Auth0 — Multiple Organization Architecture](https://auth0.com/docs/get-started/architecture-scenarios/multiple-organization-architecture)
- [Configcat — Dashboard update Jan 2025](https://configcat.com/blog/2025/01/30/whats-new-in-configcats-dashboard/)
- [Configcat — Feature flags & settings API](https://configcat.com/docs/api/reference/feature-flags-settings/)
- [Microsoft Entra TCM — Configuration management preview](https://learn.microsoft.com/en-us/entra/id-governance/tenant-governance/configuration-management)
- [Microsoft TCM — Continuous control commentary](https://blog.interian.be/2026/02/22/tenant-configuration-management-microsoft-moves-tenant-governance-into-continuous-control/)
- [Onething Design — B2B SaaS UX 2026](https://www.onething.design/post/b2b-saas-ux-design)

### Sources we could not access

- \`docs.launchdarkly.com/home/feature-workflows/environment-approvals/\` —
  the canonical environment-approvals page redirected then 404'd on the
  redirect target. Same content reachable via the \`approval-requests\` and
  \`approval-reviews\` pages above. The approval-specific UI details in
  §2.3 are drawn from those alternates plus the launch blog.
- We did not access live screenshots of any of these dashboards. Visual
  details (chip placement, drawer layout, exact colors) are inferred
  from the docs prose, not observed. Flagged with "Inference:" where
  used.
`;export{e as default};