var e=`# Pulse → Action → Calibration Loop — Architecture Spec

> **Status:** Shipped in v23 (loop forward edge), v24 (inverse edge), v25
> (visibility surfaces). MCP + Backstage extensions in v26.
> **Last refreshed:** 2026-05-12.
> **Reference impl:**
> [\`src/data/truth/actions.ts\`](../../src/data/truth/actions.ts),
> [\`src/data/truth/pulseFeedback.ts\`](../../src/data/truth/pulseFeedback.ts),
> [\`src/data/truth/recentlyLearned.ts\`](../../src/data/truth/recentlyLearned.ts),
> [\`mcp-server/index.js\`](../../mcp-server/index.js),
> [\`backstage-plugin/src/PulseSignalsCard.tsx\`](../../backstage-plugin/src/PulseSignalsCard.tsx),
> [\`bff/src/pulse-sweep.test.js\`](../../bff/src/pulse-sweep.test.js).
> **License:** [Apache-2.0](../../LICENSE) on the reference implementation.

---

## Executive summary

The Pulse → action → calibration loop is the *self-driving* core of Truehound:
operational signals detected by the Pulse derivation become two-key-approved
corrective actions with \`cause.kind: "pulse"\` and a linked-signal manifest,
and the act of executing those actions feeds an implicit \`useful\` vote back
into the same calibrator that decides which categories of Pulse signal are
worth surfacing. The loop matters because it closes the only honest feedback
channel a rule-based detector has — outcomes, not opinions — without ever
removing the human signature requirement from the write path.

---

## 1. The loop, end-to-end

\`\`\`
                      ┌──────────────────────────────────────┐
                      │ 1. Pulse signal detected             │
                      │    (BFF /api/v1/admin/datadog-       │
                      │     watchdog/ingest, Truehound-native    │
                      │     anomaly/regression/drift rules)  │
                      └──────────────┬───────────────────────┘
                                     │  store.upsert(tenant, "pulse", row)
                                     ▼
                      ┌──────────────────────────────────────┐
                      │ 2. runPulseSweep()  (hourly)         │
                      │    • snapshot persistent signatures  │
                      │    • diff against prior bucket       │
                      │    • for each NEW signature:         │
                      │        emit pulse.signal_opened      │
                      │        appendAudit (hash-chained)    │
                      └──────────────┬───────────────────────┘
                                     │
                       ┌─────────────┴──────────────┐
                       ▼                            ▼
            ┌────────────────────┐       ┌─────────────────────┐
            │ Operator clicks    │       │ Agent calls         │
            │ "Propose action"   │       │ propose_action      │
            │ on /pulse row      │       │ with linked_signals │
            │ (or Backstage      │       │ via MCP             │
            │  deep-link)        │       │                     │
            └─────────┬──────────┘       └──────────┬──────────┘
                      │                             │
                      └──────────────┬──────────────┘
                                     ▼
                      ┌──────────────────────────────────────┐
                      │ 3. actionStore.propose({             │
                      │      cause: { kind: "pulse", id },   │
                      │      linkedSignals: [PulseSignalRef] │
                      │    })  →  CorrectiveAction(open)     │
                      │    → audit: action.proposed          │
                      └──────────────┬───────────────────────┘
                                     ▼
                      ┌──────────────────────────────────────┐
                      │ 4. Two-key approval                  │
                      │    safe        → 1 signature         │
                      │    reversible  → 2 signatures        │
                      │    destructive → 3 signatures        │
                      │    (proposer cannot self-approve)    │
                      │    → audit: action.approved          │
                      └──────┬─────────────────────┬─────────┘
                 quorum │                     │ reviewer declines
                reached │                     ▼ (from open OR approved)
                        │      ┌─────────────────────────────────┐
                        │      │ 4r. actionStore.reject()        │
                        │      │   → status: "rejected"          │
                        │      │   → audit: action.rejected      │
                        │      │   (terminal; also the auto-     │
                        │      │    reject on approval timeout)  │
                        │      └─────────────────────────────────┘
                        ▼
                      ┌──────────────────────────────────────┐
                      │ 5. actionStore.execute()             │
                      │    → status: "merged"                │
                      │    → audit: action.merged            │
                      │    (demo: no-op; prod: adapter call) │
                      └──────────────┬───────────────────────┘
                                     │
                                     │  v24: implicit feedback edge
                                     ▼
                      ┌──────────────────────────────────────┐
                      │ 6. For each ref ∈ action.linkedSignals:│
                      │    pulseFeedbackStore.mark({         │
                      │      signalId: ref.signature,        │
                      │      outcome: "useful",              │
                      │      note: "Implicit vote from       │
                      │             action <id> (executed)"  │
                      │    })                                │
                      └──────────────┬───────────────────────┘
                                     ▼
                      ┌──────────────────────────────────────┐
                      │ 7. buildSignalCalibration (v13)      │
                      │    rolls feedback into per-category  │
                      │    verdicts: noisy / useful /        │
                      │    neutral / insufficient            │
                      └──────────────┬───────────────────────┘
                                     ▼
                      ┌──────────────────────────────────────┐
                      │ 8. Next signal in same category:     │
                      │    applyCalibration steps severity   │
                      │    ±1 rung with a "Tuned" chip       │
                      │    explaining why.                   │
                      └──────────────────────────────────────┘
\`\`\`

The forward edge (steps 1–5) is the v23 contract — the audit chain now names
*which* signal a proposal cites, not just the timestamp. The inverse edge
(step 6) is the v24 contract — the calibrator updates from outcomes, not
just operator clicks. Step 7–8 are the v13 contract the loop now drives.

**Reject is the third terminal (step 4r).** A reviewer who disagrees with a
proposal declines it instead of signing. \`actionStore.reject(id, by, reason)\`
([\`src/data/truth/actions.ts\`](../../src/data/truth/actions.ts)) drives the
transition to \`rejected\` and seals an \`action.rejected\` audit entry naming the
reviewer + verbatim reason. The same terminal is reached automatically when an
\`open\` action's approval \`timeoutAt\` lapses — the lazy sweep marks it
\`rejected\` and emits a synthetic \`action.rejected\` event so the lifecycle never
leaves a dangling \`open\` row. Across the BFF (\`bff/src/actions-approval.js\`,
\`rejectAction\`) and the MCP \`reject_action\` tool
([\`src/data/mcp/tools.ts\`](../../src/data/mcp/tools.ts)) the reviewer may
reject from **either** \`open\` **or** \`approved\` — a proposal can be killed
before *or* after it reaches quorum. The full state machine is therefore:

\`\`\`
draft ─► open ─approve─► open (quorum not yet met)
              └approve─► approved ─execute─► merged ─(undo)─► reverted
              └reject──► rejected (terminal)        └execute─► failed
   approved ─reject──► rejected (terminal)
   open ─(timeout)──► rejected (terminal; auto)
\`\`\`

\`executed\`/\`merged\`, \`rejected\`, and \`failed\` are terminal; the BFF names the
success terminal \`executed\` while the in-memory store names it \`merged\` (same
state — see § 6).

---

## 2. Persistence kinds involved

The BFF's \`KINDS\` list (\`bff/src/persistence/index.js\`) carries five kinds
that participate in the loop. Each is multi-tenant-scoped (every row carries
\`tenant_id\`; reads route through \`withTenant\`).

**\`pulse\`** — raw detection rows. One row per detected signal, keyed by a
detector-supplied id (e.g. \`dd-watchdog-<story_key>\` for Datadog Watchdog
ports; Truehound-native rules use a hash of \`(service, category, evidence)\`).
The \`runPulseSweep()\` reader groups by \`signature\` to materialize persistent
signals. Retention: 60 days rolling (longer than the calibration window so
back-fills are honest).

**\`pulse-feedback\`** — operator outcomes per signal. One row per
\`(tenant, signalId)\`; replaced on re-vote. Holds both explicit clicks
(\`note\` field empty or human-typed) and the v24 implicit-action votes
(\`note: "Implicit vote from action <id> (executed)"\`). Read by
\`buildSignalCalibration\` and the v25 \`buildRecentlyLearned\` derivation.
Retention: bounded to \`MAX_ENTRIES = 2000\` per tenant via LRU trim.

**\`pulse-snapshots\`** — hour-bucketed snapshots of the persistent-signal
set. The sweep persists each tick's snapshot so the next tick can diff and
emit \`pulse.signal_opened\` exactly once per newly-appearing signature. Without
this, a BFF restart would replay every signal as "new". Retention: keeps the
prior + current bucket only; older snapshots pruned on each sweep.

**\`action\`** — \`CorrectiveAction\` records (the BFF mirror of the SPA's
\`actionStore\`). When \`cause.kind: "pulse"\`, the row also carries
\`linkedSignals[]\` so the audit query can name the proximate evidence without
joining. Retention: capped at \`MAX_ACTIONS = 100\` per tenant in the SPA
store; production BFF persists indefinitely (compliance-driven).

**\`audit\`** — the hash-chained event log. Every loop step appends:
\`pulse.signal_opened\` at the sweep, \`action.proposed\` / \`action.approved\` /
\`action.merged\` at the write side. Each event seals
\`hash = sha256(prevHash || canonicalize(event))\` per
[AUDIT_CHAIN.md § 4.3](AUDIT_CHAIN.md#43-verification-algorithm). Retention:
tenant-configurable (\`tenantConfig.compliance.auditRetentionDays\`, default
395 days); S3 Object Lock COMPLIANCE mode mirror enforces 7 years when
\`ATLAS_S3_AUDIT_BUCKET\` is set.

---

## 3. Type contracts

### 3.1 \`CorrectiveAction.cause\` — v23 widened discriminator

\`\`\`ts
cause: { kind: "drift" | "insight" | "pulse" | "manual"; id: string }
\`\`\`

The \`"pulse"\` variant is the loop's anchor. \`id\` is the persistent-signal
signature (the dedup key the v18 sweep + v14 persistent-signals contract
produce); keep it stable across detection events so the audit chain
references survive recomputation. \`actionStore.hasOpenFor(targetId, causeId)\`
collapses the propose CTA to "Action in flight" when one is already filed
against the same \`(service, signature)\`.

### 3.2 \`PulseSignalRef\` — proximate-cause evidence

Defined in [\`src/data/truth/types.ts\`](../../src/data/truth/types.ts):

\`\`\`ts
/**
 * Reference to a persistent Pulse signal attached to an action as
 * proximate-cause evidence. Identified by \`signature\` (the dedup key
 * the v18 sweep + v14 persistent-signals contract produce) so the
 * link survives across detection events.
 */
export interface PulseSignalRef {
  signature: string;
  service: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  /** Last seen at the time the action was proposed. */
  lastDetectedAt: string;
  /** Short human-readable description, captured at propose time. */
  description: string;
}
\`\`\`

\`CorrectiveAction.linkedSignals?: readonly PulseSignalRef[]\` is the field on
the action itself; captured at propose-time so the audit record names *which*
signals the operator (or agent) was reacting to, not just the current set.

### 3.3 \`PulseFeedback\` — calibrator input

Defined in [\`src/data/truth/pulseFeedback.ts\`](../../src/data/truth/pulseFeedback.ts):

\`\`\`ts
export type PulseFeedbackOutcome = "useful" | "noise";

export interface PulseFeedback {
  signalId: string;
  /** Service the signal pointed at — kept on the entry so calibration
   *  can roll up per-team without re-joining. */
  service: string;
  /** Team that owns the service. */
  team: string;
  /** Pulse category from the signal — "anomaly" / "regression" /
   *  "drift" / "saturation". */
  category: string;
  outcome: PulseFeedbackOutcome;
  actor: string;
  at: string;
  /** Optional free-text rationale. */
  note?: string;
}
\`\`\`

The v24 implicit-vote contract sets \`outcome: "useful"\` and a stable
\`note\` prefix:

\`\`\`
"Implicit vote from action <action.id> (executed)"
\`\`\`

\`buildRecentlyLearned\` (v25) splits entries by \`note.startsWith("Implicit vote from action")\`
into implicit-action votes vs. explicit operator clicks; the \`/pulse\`
"% from action" headline is derived from that split.

---

## 4. MCP integration

### 4.1 \`propose_action\` carries \`linked_signals[]\` (v23)

The MCP \`propose_action\` tool gained an optional array input field. Servers
implementing the [Truth-Layer Extension](MCP_TRUTH_LAYER_EXTENSION.md)
filter malformed entries (missing \`signature\` or \`service\`) server-side and
echo the validated array on the response envelope.

\`\`\`jsonc
// Input
{
  "name": "propose_action",
  "arguments": {
    "target": { "kind": "service", "id": "svc-checkout-api" },
    "intent": "Restart checkout-api after sustained latency regression",
    "risk": "reversible",
    "linked_signals": [
      {
        "signature": "checkout-api:latency-regression:p99",
        "service": "checkout-api",
        "severity": "high",
        "category": "regression",
        "last_detected_at": "2026-05-12T11:02:00Z",
        "description": "p99 latency 2.4× baseline for 38m"
      }
    ]
  }
}

// Response (truncated)
{
  "_truth_layer": {
    "action_id": "act-7f3a",
    "audit_chain_id": "8a3f...c12",
    "approval": { "required_approvers": 2, "current_approvers": 0, ... },
    "status": "open",
    "linked_signals": [
      { "signature": "checkout-api:latency-regression:p99", "service": "checkout-api", ... }
    ]
  }
}
\`\`\`

When the \`linked_signals\` array is empty after filtering, the key is omitted
entirely from the envelope rather than echoed as \`[]\` — keeps the wire format
tight for callers that don't use the feature.

### 4.2 \`query_action_history\` returns the history (v26)

A new read tool (the MCP-side equivalent of the SPA's v25
\`buildActionHistoryForSignature\` derivation) lets an agent ask *"what has
Truehound already filed against this service?"* before proposing duplicates of
in-flight work:

\`\`\`jsonc
{
  "name": "query_action_history",
  "inputSchema": {
    "type": "object",
    "required": ["service"],
    "properties": {
      "service":   { "type": "string" },
      "signature": { "type": "string" },
      "limit":     { "type": "integer", "minimum": 1, "maximum": 200, "default": 20 }
    }
  }
}
\`\`\`

Routes to \`GET /api/v1/actions/history?service=<>&signature=<>&limit=<>\`.
The response carries \`action_history: [{ action_id, cause, status, ... }]\`
inside the \`_truth_layer\` envelope alongside an \`ownership_confidence\`
snapshot, so an agent gets the full propose-or-not context in one
round-trip.

---

## 5. Backstage integration

### 5.1 \`PulseSignalsCard\` "Propose action" deep-link (v24)

The open-source plugin's \`PulseSignalsCard\`
([\`backstage-plugin/src/PulseSignalsCard.tsx\`](../../backstage-plugin/src/PulseSignalsCard.tsx))
renders one row per persistent signal for the entity in view, each with a
deep-link button that opens the Truehound SPA pre-focused on the matching \`/pulse\`
row:

\`\`\`
\${atlasBaseUrl}/#/pulse?signature=<signature>
\`\`\`

The SPA reads the \`signature\` query param, scrolls the matching row into
view, and applies a focus ring so the operator lands directly on the
proposal CTA. No new contract on the SPA side — it's a routing parameter
the existing page consumes.

### 5.2 \`ActionHistoryCard\` (v26 leg 4)

The plugin's \`AtlasClient.fetchActionsForService(serviceName, opts)\` calls
the BFF's action-history endpoint and backs an \`ActionHistoryCard\` entity
overview. The card surfaces the same \`(action_id, cause, linkedSignals,
status)\` rows the MCP \`query_action_history\` tool returns, so a developer
on Backstage sees the same propose-or-not context as an agent reading the
truth layer. Returns an empty array (never \`null\`) so the card can render
its empty state explicitly.

---

## 6. Test parity across runtimes

The loop's contracts run in **five runtimes** with parity tests in each
tree. As of 2026-05-12 the totals are:

| Runtime | Stack | Tests |
|---|---|---|
| SPA | TypeScript + Vitest (\`src/**/*.test.ts(x)\`) | **608** |
| BFF | JavaScript + \`node:test\` (\`bff/src/**/*.test.js\`) | **216** |
| MCP | JavaScript + \`node:test\` (\`mcp-server/test.js\`) | **49** |
| Backstage plugin | TypeScript + \`node:test\` (\`backstage-plugin/src/*.test.js\`) | **21** |
| Slack-relay | JavaScript + \`node:test\` (\`examples/slack-relay/src/*.test.js\`) | **8** |
| **Total** | — | **902** |

Loop-specific coverage (v23–v25):

- **SPA**: \`actions.test.ts\` (pulse-cause + \`linkedSignals\` + \`hasOpenFor\`),
  \`recentlyLearned.test.ts\` (implicit-vs-explicit split),
  \`actionHistoryForSignature.test.ts\`, \`IncidentSignalsAttachment\` cross-link
  tests.
- **BFF**: \`pulse-sweep.test.js\` (emit + audit), \`pulse-signal-detector.test.js\`
  (one event per new signature), \`datadog-watchdog-roundtrip.test.js\`
  (DD story → \`pulse\` upsert → sweep → webhook + audit).
- **MCP**: v23 round-trip (\`linked_signals\` echo), omit-when-empty,
  drop-malformed-entries; v26 \`query_action_history\` returns synthetic rows
  with ownership-confidence envelope.
- **Backstage**: \`PulseSignalsCard\` render + deep-link href; \`AtlasClient\`
  \`fetchActionsForService\` happy-path + error states.
- **Slack-relay**: formatter + HMAC verification — the loop's outbound edge
  routes \`pulse.signal_opened\` through the same relay substrate that ships
  \`ownership_confidence.changed\`.

All five suites are required on every PR via CI; a regression in any one
fails the whole pipeline.

---

## 7. What's NOT in the loop

The contract is deliberately narrow. Three boundaries that the loop
**does not** cross:

### 7.1 Auto-approval is not allowed — ever

The loop **never** approves an action without a human signature quorum.
\`APPROVALS_BY_RISK = { safe: 1, reversible: 2, destructive: 3 }\`
([\`src/data/truth/actions.ts\`](../../src/data/truth/actions.ts)). An agent
calling \`propose_action\` via MCP files an open proposal; nothing more.
The MCP server's obligations (\`MCP_TRUTH_LAYER_EXTENSION.md § 5.3\`)
forbid auto-approval, and \`actionStore.approve\` refuses approvals from the
proposer (\`a.proposedBy === by\` returns the unchanged record). A signal
that fires every minute does not lower the bar.

### 7.2 Auto-execution of vendor mutations is not in scope

\`actionStore.execute()\` is a *no-op* in the demo — it transitions state to
\`merged\`, writes an \`action.merged\` audit event, and (v24) records implicit
feedback. **It does not call any vendor API.** Production wires real
adapters at the BFF layer; that wiring is intentionally out-of-band
from the contract documented here. The state machine is the real shape;
the adapter is a per-tenant integration concern.

### 7.3 Implicit votes are votes, not vetoes

The v24 implicit-\`useful\` vote written when a \`cause.kind: "pulse"\` action
reaches \`merged\` is recorded with full provenance
(\`note: "Implicit vote from action <id> (executed)"\`) and goes through
the *same* \`pulseFeedbackStore.mark\` path as an operator click. It does
**not** override an existing explicit vote on the same signal — \`mark\`
replaces by \`signalId\`, so the most recent vote wins, regardless of source.
An explicit thumbs-down from a human is not silently outweighed by a
later implicit \`useful\`; the calibrator sees the operator's verdict.
Conversely, \`buildRecentlyLearned\`'s "% from action" headline distinguishes
the two so the user can read the loop's contribution honestly — it never
hides the implicit channel under the explicit one.

---

## 7½. Break-glass — the one audited exception to the two-key rule

The two-key rail (\`§ 7.1\`) is the product's trust feature. There is exactly
one sanctioned way around it, and it is designed so the audit story gets
*stronger*, not weaker: **even the emergency path is fully audited and forces
review.**

> **Reference impl:** \`actionStore.executeBreakGlass\` +
> \`breakGlassEligible\` + \`breakGlassReviewItems\` in
> [\`src/data/truth/actions.ts\`](../../src/data/truth/actions.ts); the UI in
> [\`src/pages/actions/ActiveActionCard.tsx\`](../../src/pages/actions/ActiveActionCard.tsx);
> mandatory-review surfacing in
> [\`src/data/truth/autoRcaDraft.ts\`](../../src/data/truth/autoRcaDraft.ts)
> (postmortem scaffold) and \`useWorkQueue\` (team queue).

### When it is available

Break-glass renders **only** when \`breakGlassEligible(action, incidents)\`
returns a non-null incident, i.e. **all** of:

1. the action targets a **service**;
2. an incident on that service (its \`serviceId\` *or* \`relatedServiceIds\`) is
   still **\`open\`**; and
3. that incident is severity **\`critical\`** (the codebase's term for sev-1).

When no incident qualifies, the affordance does not render at all. The store
re-checks the same predicate inside \`executeBreakGlass\`, so a stale render or
a UI bug can never bypass the gate.

### What it does

A single approver (never the proposer) can execute immediately, but the
trade-offs are explicit and irreversible:

| Consequence | Mechanism |
|---|---|
| (a) Justification required, **min 20 chars** | \`BREAK_GLASS_MIN_JUSTIFICATION\`, enforced at the store boundary |
| (b) Action marked \`break_glass\` **forever** | \`CorrectiveAction.breakGlass: BreakGlassRecord\` persists with the action |
| (c) **Mandatory** post-incident review item generated | \`breakGlassReviewItems()\` → a \`critical\` open WorkItem in the **team queue** + a mandatory item at the top of the **postmortem scaffold** (Auto-RCA draft) |
| (d) Audit chain entry **tagged** with the justification | \`action.break_glass\` event whose \`cause\` is the verbatim justification, sealed *before* the \`action.merged\` event |
| (e) Absent co-signer **notified** for retroactive review | \`BreakGlassRecord.notifiedCosigner\`; the mutation hook raises the toast, the review item names who owes the co-sign |

The action runs through the **same** writeback executor as a normal execute —
break-glass changes *who may authorize*, never *what the side effect is*. The
chain therefore carries: \`action.proposed\` → \`action.break_glass\` (the
authorization, with justification + incident id) → \`action.merged|failed\`.

### Why this strengthens the trust narrative

A two-key rule with no escape hatch is brittle: a real incident commander
faced with "two co-signs required to roll back a fully-down service with no
break-glass" would route around the tool entirely, and the audit chain would
lose the most important event of the outage. The sanctioned, gated,
review-forcing break-glass keeps the emergency *inside* the audit boundary.
The single approver pays for the speed with a permanent mark, a mandatory
review, and a named co-signer who must retroactively sign off.

---

## 7¾. Autopilot: policy-approved fixes for covered risk classes

Autopilot lets the loop finish drift fixes without a person holding the key,
but only for risk classes an admin has explicitly covered. It is
deterministic rules, not a model.

- **Policy** ([\`autopilot/policy.ts\`](../../src/data/autopilot/policy.ts)):
  \`{ version, enabled, includeReversible, vetoWindowMinutes, enabledAt }\`,
  stored like the other authoring overlays (\`atlas.autopilot-policy.v1\`).
  Admin-only edits (store-boundary RBAC); every change bumps \`version\` and
  seals \`autopilot.policy_updated\`. Demo default: on, safe only, veto 0.
  Real account default: **off** until an admin consents (veto 15 min once on).
- **Eligibility** ([\`autopilotEligibility.ts\`](../../src/data/truth/autopilotEligibility.ts)):
  \`safe\` when on; \`reversible\` only when opted in; \`destructive\` never.
  Re-checked inside \`actionStore.autopilotFile\` and again before execution,
  so no caller can skip the human two-key rail for an uncovered class.
- **Lifecycle** ([\`autopilot/engine.ts\`](../../src/data/autopilot/engine.ts)): drift
  detected at or after \`enabledAt\` → \`action.proposed\` (actor
  \`system:drift-rules\`) → \`autopilot.auto_approved\` (actor \`system:autopilot\`,
  cause names the policy version) → veto window → \`actionStore.execute\` via
  the same \`activeExecutor()\` → \`action.merged\` (actor \`system:autopilot\`).
  A human \`veto\` inside the window lands \`rejected\` + \`autopilot.vetoed\`; a
  rollback is the normal \`revert\` (\`action.reverted\`). Either is remembered:
  any existing action for the same target + cause blocks a re-file. If the
  policy is switched off or narrowed during the window, the fix is handed
  back to people (\`autopilot.released\`, status \`open\`, full quorum).
- **MCP**: \`propose_corrective_action\` returns
  \`autopilot { eligible, reason, policy_version }\` from the same rule.
- **Surfaces**: \`/autopilot\` (weekly scoreboard, receipts with audit seq,
  veto, rollback, what waits on people and why), the landing/Home card, and
  Settings → Autopilot.
- **Demo seed** ([\`seed/autopilotDemo.ts\`](../../src/data/seed/autopilotDemo.ts)):
  a separate fixed-seed post-process over the seeded drift's safe fixes;
  never draws from the main dataset RNG; never runs for a real account.

---

## 8. Open questions

These are explicit invitations for community comment when the loop is
proposed for inclusion in the MCP Truth-Layer Extension v1.0:

1. **Should \`linked_signals\` be required when \`cause.kind: "pulse"\`?**
   Today the SPA \`actionStore.propose\` accepts a pulse-cause action with no
   \`linkedSignals\`, deferring to \`cause.id\` alone. Requiring at least one
   ref would force the audit chain to always carry the proximate evidence.
2. **Should implicit votes be a distinct \`outcome\` (e.g. \`"useful_implicit"\`)
   rather than overloading \`outcome: "useful"\` + note-prefix?** The note
   prefix is stable and tested, but a discriminator field would let
   downstream consumers filter without string parsing.
3. **Should the calibrator weight implicit and explicit votes differently?**
   v13's retroactive-from-incident vote is weighted at half a click. v24's
   from-execute vote currently weighs as a full click. Either is defensible;
   the spec does not yet prescribe.
4. **Should \`query_action_history\` be a separate tool or a \`query_atlas\`
   resource?** Today it's both — \`query_atlas\` already exposes the
   \`actions\` resource with a filter. The dedicated tool is the
   discoverability surface; the typed-query tool is the agent
   round-trip-budget surface. The MCP working group will decide.

---

## 9. References

- [MCP Truth-Layer Extension](MCP_TRUTH_LAYER_EXTENSION.md) — base spec the
  \`linked_signals\` extension rides on.
- [Truehound Audit Chain v0.1](AUDIT_CHAIN.md) — hash-chain semantics used by
  every audit event the loop emits.
- [\`src/data/truth/types.ts\`](../../src/data/truth/types.ts) — \`CorrectiveAction\`,
  \`PulseSignalRef\`, \`AuditEvent\`.
- [\`src/data/truth/actions.ts\`](../../src/data/truth/actions.ts) — propose /
  approve / execute state machine; v24 implicit-feedback edge.
- [\`src/data/truth/pulseFeedback.ts\`](../../src/data/truth/pulseFeedback.ts) —
  \`PulseFeedback\`, \`pulseFeedbackStore\`.
- [\`src/data/truth/recentlyLearned.ts\`](../../src/data/truth/recentlyLearned.ts) —
  implicit-vs-explicit split derivation.
- [\`mcp-server/index.js\`](../../mcp-server/index.js) — \`propose_action\`
  with \`linked_signals\`, \`query_action_history\`.
- [\`backstage-plugin/src/PulseSignalsCard.tsx\`](../../backstage-plugin/src/PulseSignalsCard.tsx)
  — entity card + deep-link.
- [\`bff/src/pulse-sweep.test.js\`](../../bff/src/pulse-sweep.test.js),
  [\`bff/src/pulse-signal-detector.test.js\`](../../bff/src/pulse-signal-detector.test.js)
  — sweep + emit contract tests.
`;export{e as default};