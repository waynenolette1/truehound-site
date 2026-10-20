var e=`# Design partner program

> The structured early-customer engagement for the first 5 Truehound customers. Founder-led. Discounted. Co-designed. Procurement-grade outputs on day one.

If you're reading this you're either evaluating Truehound as one of the first five, or you're our internal team thinking about who to invite. This is the document either side reads.

---

## What design partner means here

A design partner is **not a beta tester**. We don't ask you to find bugs we should have caught. Design partners get:

- **Founder-led engagement.** You speak directly to the engineer who wrote the code you're using. No SDR funnel, no "have you tried clearing cache" support tier.
- **Co-designed roadmap.** Your operational pain shapes what ships next. We've published [\`docs/ROADMAP.md\`](ROADMAP.md), but the first five customers move items up or down based on what they actually need.
- **Discount + multi-year lock.** Specifics are part of the conversation, but expect ~50% off list for the first 24 months in exchange for a 2-year commit + reference rights.
- **Same procurement evidence as Fortune 500 customers.** [MSA](legal/MSA.md), [DPA with EU SCCs Module Two](legal/DPA.md), [SLA](legal/SLA.md), CycloneDX SBOM, audit-chain offline verifier — all available now.
- **Named in our case studies + investor decks** (with your approval).

We're looking for **5 customers, capped**. After that the design-partner door closes and the next cohort is "general availability" at full price.

---

## What partners get access to *now* (v2.0.0)

The product partners onboard onto is the shipped v2.0.0 surface, not a
roadmap promise. Concretely, that means:

- **The authoring suite.** Postmortems, runbooks, change windows, and the
  Watchdog Stories builder are first-class authoring surfaces — partners
  write operational artifacts *in* Truehound, not just read dashboards.
- **The API + MCP tools.** The [typed customer SDK](../sdk/) and 500+ BFF
  endpoints are available day one, plus the MCP truth-layer so partners
  can drive Truehound from their own agents and automation.
- **Bring-your-own-data (BYOD).** Connect your real catalog (Backstage,
  Compass, \`catalog-info.yaml\`) and ground-truth tools (Datadog,
  PagerDuty, GitHub, ServiceNow). Truehound reconciles paper against reality
  on *your* data, not the demo dataset.
- **Two deployment shapes, both shipped.** Self-hosted-in-VPC (Helm +
  Terraform) **or** Truehound Cloud — the managed, we-run-it offering,
  currently in design-partner preview (architecture in
  [ADR-0025](adr/0025-atlas-cloud-architecture.md)). Design partners are
  the first cohort onto Cloud.
- **The full trust surface.** Tamper-evident audit chain, offline
  verifier, tenant export (GDPR Article 20) and erasure (Article 17) —
  the same isolation and portability story the hosted control plane is
  built on.

If you found this page from the **\`/cloud\` waitlist**, you're in the right
place — the waitlist *is* the design-partner intake for the managed
offering.

---

## Who we're looking for

The fit is operational, not vertical.

✅ **You're a good fit if:**

- 100-2000 engineers in 5-50 squads. Below 100 the pain isn't acute enough; above 2000 we'd want to think carefully about scale together.
- An existing IDP (Backstage, Compass, Cortex, Port, OpsLevel) that's *not* delivering reconciled truth. You don't need to be unhappy with it — Truehound sits above.
- A platform / SRE / engineering-effectiveness team that owns the IDP and has at least two weeks of capacity to wire Truehound into your stack.
- An exec sponsor (Director or VP of Engineering) who'll commit 30 minutes in Week 1 and 30 minutes in the Week 4 review.
- A meaningful operational pain you can name: catalog rot, ownership ambiguity during incidents, MTTR on sev2+, audit-evidence theatre, the next IDP migration.

❌ **You're not a good fit if:**

- You're under 100 engineers — the catalog-decay pain hasn't kicked in yet.
- You want to use Truehound as a replacement for Backstage/Cortex (we sit above; we don't compete).
- You have no integrations you can connect at evaluation time. Truehound reconciles against ground truth; you have to bring at least one ground-truth source.
- Your security team will not accept self-hosted-in-VPC OR managed SaaS as a starting topology. We support both, but if you need something neither of us has shipped (air-gapped on-prem, e.g.), the conversation gets long.

If you're unsure, email \`access@atlas.example\` with two paragraphs about your stack + the operational pain you'd want Truehound to address. We reply same business day.

---

## What the engagement looks like

### Week 0 — Provisioning

We agree on:
- Self-hosted or managed (see [DEPLOYMENT_SELF_HOSTED.md](DEPLOYMENT_SELF_HOSTED.md) + [DEPLOYMENT_HOSTED.md](DEPLOYMENT_HOSTED.md))
- The two integrations you'll connect first (typically PagerDuty + Datadog)
- The catalog source (Backstage plugin, Compass importer, or catalog-info.yaml)
- The exec sponsor + the platform-team lead

Provisioning takes 1-2 business days for managed, ~3 days for self-hosted (we walk your deploy with you).

### Weeks 1-4 — The [Customer Pilot Playbook](CUSTOMER_PILOT_PLAYBOOK.md)

Verbatim what every paid Truehound engagement runs through:

- **Week 1** — Wire ground truth. Success: ≥80% ownership coverage.
- **Week 2** — Light up drift. Success: ≥3 actionable findings triaged.
- **Week 3** — Operationalise the loop. Success: ≥1 action proposed → executed → audit-sealed end-to-end.
- **Week 4** — ROI review with the exec sponsor. Conversion trigger: MTTR delta OR a specific incident caught OR procurement evidence accepted.

### Months 2-12 — Co-design

Every two weeks:
- 30-minute call: what you tripped on, what you'd ship next, what we're working on.
- Slack channel: founder + lead engineer on Truehound, plus your platform team. No SDR, no support engineer relaying messages.

You get to drop items on the roadmap. You get to push items down. We don't promise we'll ship every ask — we promise we'll explain why if we don't.

### After year 1

The discount tier rolls into the standard contract. Reference rights stay opt-in. If we're public by then, you get a named slot on the customer page (your choice).

---

## What we ask of you

Design partner status is reciprocal. We ask you to:

1. **Treat Truehound like production.** Use it in real incidents. Tell us when it breaks. The whole point is real operational pressure.
2. **Be reachable.** A 30-minute call every two weeks with the lead engineer; same with the exec sponsor twice during Year 1.
3. **Let us reference the engagement** in case studies, sales conversations, and investor decks — with your approval on every artifact before publication. Anonymous mode is fine ("a $500M B2B SaaS company"); named is preferred. You hold the veto.
4. **Tell us about other tools in the stack** that touch the same pain. We'll integrate where the seams are clean and explicit; we won't try to be all-in-one.

---

## Pricing for design partners

We don't publish list pricing publicly (see [\`docs/positioning/README.md\`](positioning/README.md) on why). For design partners specifically:

- ~50% discount from list pricing for the first 24 months
- Annual billing, paid up front, no auto-renewal traps
- All compliance + procurement artifacts included (MSA + DPA + SLA pre-drafted)
- Migration assistance if you choose to leave at the 24-month mark — we hand over the audit chain, your tenant export, and the integration config. No lock-in tactics.

Multi-year discounts are real. So is the audit-chain export. We'd rather lose a customer cleanly than keep them on contractual fumes.

---

## What this program is NOT

- ❌ **It's not free.** Free pilots produce free signals; we want to land where it matters operationally, and a paid (discounted) seat focuses both sides. The discount is the structure.
- ❌ **It's not a beta.** The code is production-grade. 23,000+ tests across SPA + BFF + MCP + CLI + SDK + Backstage. The SLA is real.
- ❌ **It's not a "thought leadership" program.** We don't ship case studies to win Twitter; we ship them because procurement teams need reference checks.
- ❌ **It's not unstructured.** The [Customer Pilot Playbook](CUSTOMER_PILOT_PLAYBOOK.md) pins what success looks like every week. Vague goals produce vague outcomes.

---

## How to enter

Email \`access@atlas.example\` with:

\`\`\`
Subject: Truehound — design partner candidate

Hi Truehound team,

Org:
Engineering size:
Existing IDP:
Existing observability + incident response stack:
The operational pain we'd want Truehound to address (one paragraph):
The platform-team lead we'd assign:
The exec sponsor we'd assign:

Thanks.
\`\`\`

We reply same business day. If it's a fit, we book a 30-minute call within the week.

---

Related:
- [\`docs/CUSTOMER_PILOT_PLAYBOOK.md\`](CUSTOMER_PILOT_PLAYBOOK.md) — week-by-week structure
- [\`docs/positioning/CASE_STUDY.md\`](positioning/CASE_STUDY.md) — synthetic worked example (real one TK once we have a referenceable customer)
- [\`docs/ROI_MODEL.md\`](ROI_MODEL.md) — the math the Week 4 review backs into
- [\`docs/legal/\`](legal/) — MSA + DPA + SLA templates
`;export{e as default};