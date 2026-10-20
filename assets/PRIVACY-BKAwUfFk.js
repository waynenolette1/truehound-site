var e=`# Privacy & Data Flow

> The honest, verifiable answer to _"where does my data go?"_ — written for a
> customer's security team. Everything here is asserted by automated tests
> (\`e2e/privacy.spec.ts\`, \`e2e/csp.spec.ts\`) so it can't quietly drift.

## TL;DR

The Atlas **demo** (the GitHub Pages build, and any build without a configured
backend) is a **100% in-browser application**. It makes **zero** third-party
network requests and **zero** requests carrying your data. The only network
traffic is your browser fetching Atlas's own static assets (HTML, JS, CSS,
fonts, the DuckDB WebAssembly engine) from the origin that served the page.

When you use **Bring-Your-Own-Data** (Settings → Demo Controls → _Import your
data_) to upload a CSV/JSON of your service catalog, that data is parsed in
the browser, stored in this browser's \`localStorage\`, and used to regenerate
the demo locally. **It is never transmitted anywhere.** This is the literal
meaning of the on-screen promise _"Your data never leaves this browser."_

One deliberate exception, on the hosted site only: the "Try the live demo"
form sends \`{ first, last, email, utm, page }\` to our cloud connector so we
can follow up, when (and only when) the build has a connector and that
connector advertises lead capture. See _Live-demo leads and the visitor's
name_ below.

## What crosses the network (demo build)

| Request                                      | Destination                                     | Carries your data? |
| -------------------------------------------- | ----------------------------------------------- | ------------------ |
| HTML / JS / CSS chunks                       | The serving origin (same-origin)                | No                 |
| Web fonts (Figtree, JetBrains Mono \`.woff2\`) | The serving origin (\`/fonts/\`, **self-hosted**) | No                 |
| DuckDB-WASM engine + worker (\`.wasm\`, \`.js\`) | The serving origin (same-origin)                | No                 |
| Favicons / manifest / icons                  | The serving origin                              | No                 |

That's the complete list. There is:

- **No** analytics/telemetry beacon. The analytics and structured-logger
  services buffer to \`localStorage\` only (\`src/services/analytics.ts\`,
  \`src/services/logger.ts\`); they have no network transport in the demo.
  (A hosted deploy can opt in by setting \`VITE_POSTHOG_KEY\` at build time —
  see _Hosted-deploy product telemetry_ below. The demo build leaves it
  unset, so the loader injects nothing.)
- **No** error-reporting SDK (no Sentry/Datadog/etc.).
- **No** third-party font CDN. The Figtree / JetBrains Mono faces are served
  from \`public/fonts/\` — the former \`fonts.googleapis.com\` / \`fonts.gstatic.com\`
  requests (which leak the visitor's IP + User-Agent to Google on first paint)
  were removed. See _Self-hosted fonts_ below.
- **No** DuckDB extension CDN. The \`/catalog\` page hydrates an in-browser
  DuckDB table using **core SQL only** (\`src/lib/duckdb/hydrate.ts\`). It does
  **not** use \`read_json_auto\`, which would lazily fetch the \`json\` extension
  from \`https://extensions.duckdb.org\` — a third-party request that previously
  fired the moment you opened \`/catalog\`.

The Content-Security-Policy (\`scripts/csp-plugin.mjs\`) enforces this at the
browser level: \`default-src 'self'\`, no remote origins in \`style-src\`,
\`font-src\`, \`img-src\`, or \`connect-src\`. A request to any off-origin host is
blocked by the browser, not merely "not made". See
[\`docs/SECURITY.md\`](SECURITY.md) → _Transport & browser security_.

### When a backend is configured (production)

Setting \`VITE_BFF_URL\` at build time activates the HTTP repository, and Atlas
then talks to **that one BFF origin** (and only that origin — the CSP appends
it to \`connect-src\` automatically). Your data flows to your own BFF, which you
operate. No other destinations are added. Telemetry/preferences/saved-views
POSTs are all gated on \`VITE_BFF_URL\` being set and target only that origin
(\`src/data/mcp/telemetry.ts\`, \`src/hooks/usePreferences.ts\`,
\`src/hooks/useSavedViews.ts\`). The demo build leaves \`VITE_BFF_URL\` unset, so
none of those code paths can reach the network.

### When the AI layer is enabled (opt-in, connector with an Anthropic key)

Off unless the operator sets \`ANTHROPIC_API_KEY\` as a secret on the cloud
connector ([AI_LAYER.md](AI_LAYER.md)). The SPA asks \`GET /ai/health\` and shows
AI controls only when it answers \`aiEnabled: true\`. Even then, nothing is sent
until a user clicks an AI button. On that click the browser posts **repo facts
it already read** (CODEOWNERS / catalog-info.yaml / governance-file text,
commit author logins with counts, a linked PagerDuty service and team name) to
the connector, which forwards them to Anthropic's API (Claude) and returns a
validated answer. **No token or vendor key is ever part of that request**: the
GitHub token stays in this browser and is used only for direct calls to
\`api.github.com\`, including opening a fix pull request when the user clicks
"Open a pull request". The connector stores nothing.

### When a real account connects GitHub without a token

The Truth Scan reads CODEOWNERS and \`catalog-info.yaml\` bytes from
\`raw.githubusercontent.com\` (GitHub's own raw-content host, which does not
count against the 60-an-hour anonymous API budget) and tree listings from
\`api.github.com\`. Both are plain GETs for PUBLIC repo files; no token, cookie
or credential is ever sent to the raw host. With a token, every read goes to
\`api.github.com\` only. The CSP \`connect-src\` lists exactly these origins.
When Autopilot is on (paid plan) and the browser-held token can push, a safe
fix is opened as a pull request on \`api.github.com\`; without one, nothing is
written and the change is offered as a draft link to GitHub's editor.

## What is stored in your browser

Atlas persists UI state and (if you use it) your imported data to
\`localStorage\`. Nothing is stored in cookies by the demo. The keys fall into
these families:

| Key family                     | Example                                                                       | Contents                                                                                                                                                                                                                                                                                       | Sensitivity                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Imported data (BYOD)**       | \`atlas.byod.import.v1\`                                                        | Your uploaded service/team/person names                                                                                                                                                                                                                                                        | Holds data you provided. Stays local.                                                                                                                                                                                                                                                                                                           |
| **Connected workspace**        | \`atlas.live.workspace.v1\`                                                     | The snapshot pulled from sources YOU connected (services, incidents, on-call, SLOs, monitors)                                                                                                                                                                                                  | **Your operational data.** Stays local; cleared on disconnect. On sign-out it moves to the parked-workspace key below (it no longer sits in the live key).                                                                                                                                                                                      |
| **Parked workspace**           | \`atlas:parked-workspaces.v1\`                                                  | A signed-out real account's connected workspace + score history + its proof chain (\`atlas.actions.v1\`, \`atlas.actions-audit.v1\`), Autopilot policy (\`atlas.autopilot-policy.v1\`) and finding ledger (\`atlas.findings-ledger.v1\`), keyed by its email (at most 3). **Never its access tokens.** | **Your operational data.** Stays local. Restored only when the same email signs back in ("Welcome back" on the sign-in page, or Start free with that email). "Remove my workspace from this browser" removes it, both on the sign-in card and on the sign-out confirmation.                                                                     |
| **Git-host tokens**            | \`atlas.live.token.github.v1\` (gitlab/bitbucket likewise)                      | The access token you pasted, persisted so re-sync does not re-prompt                                                                                                                                                                                                                           | **Highest sensitivity: plaintext in localStorage.** Use a least-privilege read-only token (or, to let this browser open fix pull requests, one scoped to \`contents\` + \`pull requests\` write on the repos you choose). Removed on disconnect and sign-out. PagerDuty/Datadog keys are NEVER persisted: they live only in memory during the pull. |
| **Catalog imports**            | \`atlas.live.imports.v1\`                                                       | Fields merged from a Backstage, Port, Cortex or OpsLevel export you imported (owner, tier, description per matched repo), each batch tagged with its source file and time                                                                                                                      | **Your catalog data.** Stays local; the export file is read in the browser and never uploaded. Each import is undoable on its own. Parked with the workspace on sign-out.                                                                                                                                                                       |
| **Weekly digest subscription** | \`atlas.live.digest.v1\`                                                        | Whether you opted in to the weekly Slack digest, your Slack incoming-webhook URL, the week last posted, and the finding keys already reported                                                                                                                                                  | **Sensitive: the webhook URL lets anyone holding it post to that channel.** Plaintext in localStorage, like the git tokens. Sent only to the connector relay for each post, which forwards it to Slack and stores nothing. Removed by Unsubscribe and on sign-out.                                                                              |
| Auth session                   | \`atlas.session.v1\`                                                            | Demo username + role + expiry (no password)                                                                                                                                                                                                                                                    | Low — demo identity only                                                                                                                                                                                                                                                                                                                        |
| Theme / device prefs           | \`atlas.theme\`, \`atlas.prefs.*\`                                                | Light/dark, density, landing page                                                                                                                                                                                                                                                              | None                                                                                                                                                                                                                                                                                                                                            |
| Onboarding / tour flags        | \`atlas:welcome-completed\`, \`atlas:tour-completed\`, \`atlas.onboarding.seen.v3\` | "already seen" booleans                                                                                                                                                                                                                                                                        | None                                                                                                                                                                                                                                                                                                                                            |
| Navigation memory              | \`atlas.nav.recentRoutes\`, \`atlas.nav.bookmarks\`, \`atlas:cmdk:recent-*\`        | Routes you visited, pinned pages                                                                                                                                                                                                                                                               | Low                                                                                                                                                                                                                                                                                                                                             |
| List/table view state          | \`atlas.saved-views.*\`, \`atlas:columns:*\`, \`atlas:density:*\`                   | Column layout, filters, saved queries                                                                                                                                                                                                                                                          | Low                                                                                                                                                                                                                                                                                                                                             |
| Snooze / dismissal state       | \`atlas:*-snooze\`, \`atlas.insights.dismissed\`, \`atlas:highlights:acknowledged\` | Which cards/alerts you dismissed                                                                                                                                                                                                                                                               | Low                                                                                                                                                                                                                                                                                                                                             |
| Buffered analytics / logs      | \`atlas.analytics.queue.v1\`, \`atlas.errorLog.v1\`, \`atlas.telemetry.*\`          | Local event buffer (never uploaded in the demo)                                                                                                                                                                                                                                                | Low                                                                                                                                                                                                                                                                                                                                             |
| Catalog / DuckDB scratch       | \`atlas:catalog:query-history\`, \`atlas:catalog:pinned-queries\`                 | SQL you typed on \`/catalog\`                                                                                                                                                                                                                                                                    | Low (could echo imported names)                                                                                                                                                                                                                                                                                                                 |

### Live-demo leads and the visitor's name

"Try the live demo" asks for a first name, last name and work email, then
opens the demo. The small print says it plainly: we use the email to follow up
about Truehound, nothing else.

- \`atlas.demo.visitor.v1\` holds \`{ first, last }\`, in this browser only, so the
  demo greets the visitor by name (greeting, avatar initials, profile menu,
  "you" labels). It changes the demo persona's display name only, never its
  identity. Settings > "Reset demo data" removes it.
- The lead \`{ first, last, email, utm, page }\` (\`utm\` = any \`utm_*\` params on
  the link, \`page\` = the route the form was opened from) is sent to the cloud
  connector's \`POST /lead\` **only** when this build has a connector
  (\`VITE_CONNECTOR_URL\`) **and** its \`/health\` lists the \`leads\` feature (a
  deploy with the \`LEADS\` KV namespace bound). The connector stores exactly
  those fields plus a server timestamp \`ts\`, nothing else: no IP address, no
  user agent, no cookies. The client IP is used in memory for rate limiting
  only and is never written.
- Otherwise (no connector, an older connector, an error or a slow answer) the
  lead stays in this browser only, under \`atlas.demo.leads.v1\` (the last five),
  and is never sent. The demo opens either way.
- Leads are read back only by the operator with \`scripts/list-leads.mjs\`
  (bearer \`LEADS_ADMIN_TOKEN\`) as CSV. A visitor who wants their lead deleted
  emails the sales address; the operator deletes the KV key.
- Analytics events (\`demo_lead.opened\`, \`demo_lead.submitted\`, ...) carry no
  name or email, only the outcome.

### Payment and entitlement (no free tier)

A real workspace opens only once it is paid. Whether it is paid is checked
**through the cloud connector**, and the answer is then **cached in this
browser**:

- \`atlas.workspace.entitlement.v1\` holds \`{ status, plan, email, via,
  sessionId?, verifiedAt? }\`: the plan picked at signup (\`pending\`), or the
  connector's confirmation (\`paid\`, via a Stripe Checkout Session or a sales
  activation code). It is parked with the workspace on sign-out, so a paying
  customer who signs back in with the same email is not locked out again.
- To confirm a Stripe payment the browser sends the connector the Checkout
  Session id from Stripe's redirect (\`GET /billing/verify?session_id=\`); the
  connector asks Stripe with the operator's secret key and returns only
  \`{ paid, plan, customerEmail }\`. To use an activation code the browser sends
  the code and the account email (\`POST /billing/activate\`). Nothing else is
  sent, and the connector stores nothing.
- Card details never touch this app or the connector: they are entered on
  Stripe's own checkout page.
- Honest limit: because the confirmation is cached client-side (there is no
  server-side account store yet), someone with devtools could forge the
  cache for their own browser. The check is real; the cache is not an
  enforcement boundary. See docs/SECURITY.md.

A complete, always-current key list lives in code — search the source for the
literal key strings; the families above cover every \`atlas.\`- and \`atlas:\`-
prefixed key the app writes.

## What clears it

| Action                                            | Clears                                                                                                                                                                                | Leaves behind (remanence)                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reset to demo data** (Settings → Demo Controls) | \`atlas.byod.import.v1\` (your imported data)                                                                                                                                           | All other UI-state keys remain — by design; reset restores the seeded catalog, it is not a privacy wipe                                                                                                                                                                                                                                                                                       |
| **Sign out**                                      | Every \`atlas.\`-prefixed key **except** \`atlas.theme\` (so a second user on a shared machine doesn't inherit the first user's snooze lists, saved views, session, or **imported data**) | \`atlas.theme\` (device preference) and **\`atlas:\`-colon-prefixed keys** (onboarding flags, command-palette recents, column presets, snooze state) — these are _not_ cleared by sign-out today. A **real account's** connected workspace is parked in \`atlas:parked-workspaces.v1\` under its email (tokens removed) so the same person signing back in keeps it; a different email starts empty |
| **Browser "clear site data" / private window**    | Everything                                                                                                                                                                            | Nothing                                                                                                                                                                                                                                                                                                                                                                                       |

### Known remanence (full disclosure)

- **Reset to demo data clears only the import**, not other UI state. It is a
  "restore the demo catalog" button, not a privacy wipe. To remove imported
  data specifically, Reset is sufficient — the import lives in exactly one key.
- **A real account's workspace survives sign-out, by design.** There is no
  server to hold it, so sign-out parks it locally under the account's email
  (\`atlas:parked-workspaces.v1\`, access tokens excluded) and the sign-in page
  offers "Welcome back" to that email. On a shared machine, use "Forget this
  workspace" on the sign-in page (or clear site data) to remove it.
- **Sign-out clears \`atlas.*\` but not \`atlas:*\` keys.** The colon-namespaced
  keys are non-sensitive UI flags (onboarding-seen, recent routes, column
  presets, snooze state) and never hold imported data — the BYOD import is an
  \`atlas.\`-key and _is_ cleared on sign-out. Still, for a guaranteed clean
  slate on a shared machine, use the browser's "clear site data".

If either of these behaviors changes, update this table in the same PR (per
[\`docs/DOCUMENTATION_POLICY.md\`](DOCUMENTATION_POLICY.md)).

## Hosted-deploy product telemetry (opt-in at build time)

Everything above describes the **default build** and remains true for it:
no analytics beacon exists, and \`VITE_POSTHOG_KEY\` is **unset** for the
public demo deploy.

A deployment that sets \`VITE_POSTHOG_KEY\` at build time (see
[\`ENV_VARS.md\`](ENV_VARS.md)) opts into product analytics via PostHog, and
the honest consequences are:

- **What loads.** \`src/services/posthog.ts\` injects the official posthog-js
  bundle (\`array.js\`) from the configured PostHog host's assets origin —
  Atlas bundles no analytics SDK of its own. The CSP is widened at build
  time to exactly that host pair (\`scripts/csp-plugin.mjs\`), nothing else.
  With no key, the loader injects nothing and makes zero network calls —
  identical behavior to before this feature existed.
- **What is sent.** Pageviews on every route change with the route path
  **normalized** (\`/incidents/INC-42\` becomes \`/incidents/:id\` —
  \`src/services/routeNormalizer.ts\`), autocaptured clicks with **all element
  text masked** (\`mask_all_text\`), and named product events (signup, login,
  integration connect outcomes, upgrade intent). Event props carry enums and
  booleans, not free text.
- **What is deliberately NOT sent.** Email addresses, never — \`identify()\`
  forwards a role plus a distinct id, and an email-shaped id is replaced by
  a non-reversible digest first (\`src/services/analytics.ts\`). No session
  recording (\`disable_session_recording\`). Browser Do Not Track is honored
  (\`respect_dnt\`). Imported/BYOD data and connected-source payloads never
  pass through the analytics layer at all.
- **What leaks anyway, stated plainly.** PostHog receives the visitor's IP
  address and User-Agent as a property of any HTTP request, and
  \`$current_url\` on events includes the full page URL (origin + hash
  route). Clicked elements' tag/class/id attributes ride along with
  autocapture. If that is unacceptable for your deployment, leave the key
  unset — the local analytics buffer keeps working with no egress.
- **The local buffer stays on.** Settings → recent events shows the same
  trail whether or not PostHog is enabled; enabling PostHog adds a second
  sink, it does not replace the first.

Verification for telemetry-enabled builds lives in
\`scripts/uitest/verify-analytics.mjs\` (see
[\`launch/TEST_MATRIX.md\`](launch/TEST_MATRIX.md)): it intercepts every
request bound for the PostHog ingestion host and asserts pageviews are
normalized before anything leaves the page.

## Self-hosted fonts

Atlas serves the Figtree and JetBrains Mono webfonts from its own origin
(\`public/fonts/*.woff2\`) via same-origin \`@font-face\` declarations in
\`src/index.css\`. Previously \`src/index.css\` did
\`@import url("https://fonts.googleapis.com/...")\`, which made the browser
issue a request to Google Fonts on every page load — exposing the visitor's
**IP address and User-Agent** to a third party before the app even rendered.
That is incompatible with "your data never leaves this browser", so it was
removed. The exact same \`.woff2\` files Google served are now shipped in the
bundle; rendering is pixel-identical (variable fonts, latin + latin-ext
subsets with Google's canonical \`unicode-range\` split).

## How this is verified

- [\`e2e/privacy.spec.ts\`](../e2e/privacy.spec.ts) imports a CSV/JSON of
  distinctive sentinel names, drives every data-rendering surface (including
  \`/catalog\`'s DuckDB boot) and the command-palette search, and asserts:
  (1) **no** network request — URL, query, POST body, or header — contains any
  imported string; (2) **every** request is same-origin; (3) **no** known
  telemetry/font/CDN host is contacted.
- [\`e2e/csp.spec.ts\`](../e2e/csp.spec.ts) asserts the shipped CSP allowlists
  **no** third-party origin and that a full walkthrough fires zero
  \`securitypolicyviolation\` events.

Both run in CI on every PR. A regression that re-introduces egress fails the
build.
`;export{e as default};