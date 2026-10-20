var e=`# DORA Annex: Register of Information

> **Template: not legal advice.** This is a pre-filled starting point a
> financial-entity customer (and its counsel) can lift into its own DORA
> Register of Information. It describes the hosted Truehound app as it
> actually works. A self-hosted deployment (available only by order form)
> would engage no Truehound sub-processors; treat the relevant rows as N/A.
> Bracketed \`[…]\` placeholders are completed at signing or by the financial
> entity's own register owner.

## What this is

The EU **Digital Operational Resilience Act** (Regulation (EU) 2022/2554,
applicable from 2025-01-17) requires every in-scope **financial entity** to
maintain a **Register of Information** (Article 28(3)) on its contractual
arrangements for ICT services provided by ICT third-party service providers.
The structure and fields are set by Commission Implementing Regulation
**(EU) 2024/1773** as a set of linked templates (RT.01.xx to RT.07.xx).

Truehound (\`[LEGAL_ENTITY: e.g. Truehound LLC, a [State] limited liability company]\`)
is an **ICT third-party service provider** to a financial-entity customer.
This annex pre-fills the register fields that describe Truehound and maps the
**DORA Article 30 contractual provisions** to where the contract pack covers
them, and says plainly where it does not. The contract-grade sub-processor
list is [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md).

---

## Part A: Truehound as ICT third-party service provider

### A.1 Provider identification (RT.05.01 / RT.06.01 fields)

| Register field | Value |
|---|---|
| Name of the ICT third-party service provider | \`[LEGAL_ENTITY]\` |
| Identification code (LEI, if held) | \`[LEI, if obtained]\` |
| Type of code | \`[LEI / EUID / other]\` |
| Country of registered office | United States (\`[LEGAL_ENTITY state]\`) |
| Parent undertaking (if any) | None |
| Contact | \`truehoundhq@truehound.io\` |
| Currency of contract value | USD |

### A.2 ICT service description (RT.04.01 / RT.02.01 fields)

| Register field | Value |
|---|---|
| Type of ICT service | Software-as-a-Service: a service-catalog tool that reads the code hosts and tools the customer connects, shows services missing an owner, an on-call rotation or a tier, and drafts fixes as pull requests |
| ICT service classification | Cloud computing service (SaaS) |
| Function supported | \`[Customer's function name]\` |
| **Supports a critical or important function (CIF)?** | \`[Yes / No, determined by the financial entity]\`. Truehound reads first and changes nothing on its own except, when the customer's admin switches Autopilot on, opening pull requests that add a \`catalog-info.yaml\`. It never pushes to a default branch and never merges ([MSA](MSA.md) § 2.3). |
| Storage of data by the provider | Minimal. The app runs in the customer's browser; tokens and catalog data stay there. Truehound has no server-side database of customer catalog data. It receives payment confirmation (session, plan, email) from Stripe ([MSA](MSA.md) § 2.2). |
| Location of data at rest | Customer catalog data: in the customer's own browsers. Billing data: Stripe. The hosted app offers no choice of data region ([MSA](MSA.md) § 2.4). |
| Sensitivity of data the provider holds | Account and billing contact details only; no special-category personal data |
| Reliance on sub-outsourcing for a CIF | See **Part B** |

### A.3 Substitutability and exit (Article 28(4), 30(2)(g))

| Register field | Value |
|---|---|
| Substitutability of the provider | Substitutable. Fixes land as standard \`catalog-info.yaml\` files and CODEOWNERS changes in the customer's own repositories, which other catalog tools read. |
| Reintegration / exit feasibility | Supported. The customer's catalog is already in its browser and its repositories; the catalog-info.yaml files Truehound helped add are ordinary files the customer owns. |
| Exit-plan / notice period | Cancel anytime, effective at the end of the paid period ([MSA](MSA.md) § 4.2) |
| Data deletion on exit | Truehound deletes the Personal Data it holds about the customer's users on request, except billing records it must keep by law ([MSA](MSA.md) § 9.4) |

---

## Part B: Sub-processor chain (Article 30(3), 30(2)(a))

| Sub-processor | Service to Truehound | Data it can see | Supports a CIF chain? | Engaged |
|---|---|---|---|---|
| Cloudflare | Runs the connector Worker: forwards PagerDuty and Datadog requests without storing keys or data, relays Slack digests without storing the webhook, confirms payments, stores demo-form leads and Truth Scan reports (30 days) in Workers KV | Requests in transit; leads; public-repository report facts | Only for the PagerDuty and Datadog pulls | Always |
| GitHub (GitHub Pages) | Hosts the website and app files | Standard request logs | Yes, the app is served from it | Always |
| Stripe | Checkout, subscriptions, billing records | Billing contact, payment metadata | No, billing only | Always for paying customers |
| PostHog | Product analytics, text masked, no session recordings | Page views and clicks | No | Only if enabled |
| Anthropic | AI drafts | Repository facts the customer's browser sends for that request; never tokens | No | Only if AI is enabled and used |

> **Not Truehound sub-processors.** The systems Truehound reads on the
> customer's behalf (GitHub, GitLab, Bitbucket, PagerDuty, Datadog, Slack)
> are the **customer's own** accounts, accessed with the customer's own
> credentials from the customer's browser. Truehound does not contract with
> them for this and does not store their secrets.

**Sub-processor change notice (Article 30(2)(a)).** Truehound gives **30
days' prior written notice** before adding or replacing a sub-processor that
processes personal data ([MSA](MSA.md) § 2.5). The customer may object and,
where Truehound cannot offer a reasonable alternative, cancel without penalty.

---

## Part C: Article 30 contractual provisions

| DORA Article 30 provision | Truehound position | Where |
|---|---|---|
| 30(2)(a) Subcontracting and notice of changes | 30-day prior notice; right to object and cancel | [MSA](MSA.md) § 2.5, [SUBPROCESSOR_LIST](SUBPROCESSOR_LIST.md) |
| 30(2)(b) Locations of service and data processing | Disclosed in Part B; no region choice for the hosted app | [MSA](MSA.md) § 2.4 |
| 30(2)(c) Data protection | HTTPS everywhere; tokens and catalog data stay in the customer's browser; no key storage on the connector | [SECURITY_ADDENDUM](SECURITY_ADDENDUM.md) |
| 30(2)(d) Access, recovery and return of data | The customer already holds its data (browser and repositories); nothing needs to be returned | [MSA](MSA.md) § 9.4 |
| 30(2)(e) Service-level descriptions | Best-effort; no uptime commitment and no credits unless an order form says otherwise | [SLA](SLA.md) |
| 30(2)(f) Assistance on ICT incidents | Notification without undue delay and reasonable cooperation | [DPA](DPA.md), [MSA](MSA.md) § 6 |
| 30(2)(g) Exit strategy | Cancel anytime; standard files in the customer's own repositories | Part A.3 above |
| 30(3)(a) Full SLA with quantitative targets | **Not offered by default.** Available only if agreed on an order form | [ORDER_FORM](ORDER_FORM.md), [SLA](SLA.md) |
| 30(3)(b) Notice periods and reporting | Defined notice and breach reporting | [DPA](DPA.md) |
| 30(3)(c) Cooperation with competent authorities | Truehound cooperates with the customer's competent authority on reasonable request | [MSA](MSA.md) § 6 |
| 30(3)(d) Termination rights | Cancel anytime; termination for breach | [MSA](MSA.md) |
| 30(3)(e) Security awareness participation | By order form | \`[Per order form]\` |

### Audit and inspection right

Truehound accepts the customer's, its auditor's and the competent authority's
right to audit Truehound in relation to the Services, on reasonable notice and
at a reasonable scope. Truehound holds no SOC 2 or ISO 27001 report and does
not represent that one exists.

---

## Part D: How to use this annex

1. The **register owner** at the financial entity copies the Part A and Part
   B rows into its Register of Information, inserting the bracketed
   identifiers (contract dates, contract value, CIF determination).
2. **Procurement and legal** map Part C against the executed contract pack
   ([MSA](MSA.md), [DPA](DPA.md), [SLA](SLA.md),
   [SECURITY_ADDENDUM](SECURITY_ADDENDUM.md), and any [ORDER_FORM](ORDER_FORM.md)).
3. Engage EU counsel to confirm the CIF determination and any entity-specific
   fields before submission.

---

**Related**

- [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md): contract-grade sub-processor list
- [\`MSA.md\`](MSA.md) § 2.4 to 2.5, § 6, § 9: data location, sub-processor notice, regulated customers, exit
- [\`SLA.md\`](SLA.md): service levels
- [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md): Article 30(2)(c) measures
`;export{e as default};