var e=`# DORA Annex — Register of Information

> **Template — not legal advice.** This is a pre-filled starting point a
> financial-entity customer (and its counsel) can lift into its own DORA
> Register of Information. It is published under the same
> [CC BY 4.0](README.md#license) terms as the rest of \`docs/legal/\`. The
> facts below describe a **hosted (Truehound-managed)** deployment per
> [\`ADR-0025\`](../adr/0025-atlas-cloud-architecture.md); a self-hosted
> customer engages **no** Truehound sub-processors and should treat the
> relevant rows as N/A. Bracketed \`[…]\` placeholders are completed at
> signing or by the financial entity's own register owner.

## What this is

The EU **Digital Operational Resilience Act** (Regulation (EU) 2022/2554,
binding 2025-01-17) requires every in-scope **financial entity** to
maintain a **Register of Information** (Article 28(3)) on its contractual
arrangements for the use of ICT services provided by ICT third-party
service providers. The structure and fields are set by the implementing
RTS — Commission Implementing Regulation **(EU) 2024/1773** — as a set of
linked templates (RT.01.xx … RT.07.xx).

Truehound, Inc. is an **ICT third-party service provider** to a financial-
entity customer. This annex pre-fills the register fields that describe
Truehound so the customer's register owner can map them straight into its own
submission, and pairs them with the **DORA Article 30 mandatory
contractual clauses** Truehound commits to in the [MSA](MSA.md) +
[DPA](DPA.md).

This annex is the **contract-grade companion** to the live public
sub-processor register at \`/#/trust/subprocessors\` (and its Atom change
feed at \`/trust/subprocessors.xml\`) — that page is the source of truth;
this document mirrors it at contract time.

---

## Part A — Truehound as ICT third-party service provider

### A.1 Provider identification (RT.05.01 / RT.06.01 fields)

| Register field | Value |
|---|---|
| Name of the ICT third-party service provider | Truehound, Inc. |
| Identification code (LEI, if held) | \`[LEI — to be inserted]\` |
| Type of code | \`[LEI / EUID / other]\` |
| Country of registered office | \`[Country of incorporation — United States (Delaware) by default, per MSA preamble]\` |
| Parent undertaking (if any) | \`[Ultimate parent, if applicable]\` |
| Person responsible (contact) | \`truehoundhq@truehound.io\` / \`security@truehound.io\` |
| Currency of contract value | \`[EUR / USD …]\` |

### A.2 ICT service description (RT.04.01 / RT.02.01 fields)

| Register field | Value |
|---|---|
| Type of ICT service | Software-as-a-Service — an engineering-operations control plane (service catalog, SLOs, incidents, monitors, on-call, releases, DORA metrics, governance) |
| ICT service classification | Cloud computing service (SaaS); ICT project / consulting **not** included |
| Function supported | \`[Customer's function name]\` |
| **Supports a critical or important function (CIF)?** | \`[Yes / No — determined by the financial entity]\`. Truehound's default posture: read-first control plane; corrective actions are gated behind two-key approval, so Truehound does not autonomously change the customer's production systems. |
| Storage of data | Yes — operational metadata + the tamper-evident audit chain |
| Location of data at rest | The customer's selected region only (us-east-1, **eu-west-1** for EU/DORA, or ap-southeast-1); data does not cross regions without written authorisation ([MSA](MSA.md) § 2.4) |
| Location of management of data | Same region as data at rest |
| Sensitivity of data stored | Operational metadata + audit records; **no** special-category personal data by default (\`tenantConfig.compliance.allowPhi\` defaults to \`false\`) |
| Reliance on sub-outsourcing for a CIF | See **Part B** — the sub-processor chain |

### A.3 Substitutability + exit (Article 28(4), 30(2)(g))

| Register field | Value |
|---|---|
| Substitutability of the provider | Substitutable. Truehound runs on a generic BFF + Postgres + object-store topology; a self-hosted shape exists for the same product. |
| Reintegration / exit feasibility | Supported. Full export of catalog + audit chain via the data-portability format ([\`../enterprise/DATA_PORTABILITY.md\`](../enterprise/DATA_PORTABILITY.md)); audit chain is independently verifiable offline. |
| Exit-plan / notice period | \`[Per MSA § 9 — termination + transition assistance]\` |
| Data deletion on exit | Delete or return within 60 days of termination, subject to the customer's compliance-config retention and any legal hold ([DPA](DPA.md) § 9.1, [MSA](MSA.md) § 9.4) |

---

## Part B — Sub-processor chain (Article 30(3), 30(2)(a))

Truehound's own ICT sub-contractors. **AWS** and **Stripe** are the always-on
core; the email + SSO-broker rows are engaged only when the customer
turns on that capability. This mirrors the live register at
\`/#/trust/subprocessors\`.

| Sub-processor | Service to Truehound | Data it can see | Country / region of data | Supports a CIF chain? | Engaged |
|---|---|---|---|---|---|
| Amazon Web Services (AWS) | Compute, managed Postgres, Object-Locked audit archive, KMS | All operational metadata + audit chain | Tenant order-form region (\`eu-west-1\` for EU) | Yes — primary infrastructure host | Always |
| Stripe | Subscription billing + metered usage (direct purchases) | Billing contact, payment metadata | US (EU processing for EU customers) | No — billing only | Conditional (bypassed on marketplace purchase) |
| \`[Transactional email provider]\` | Account / billing / incident-notification email | Recipient name + email | \`[Region selected at provisioning]\` | No | Conditional (only when outbound email enabled) |
| \`[SSO identity broker]\` | SAML / OIDC SSO brokering | Authentication subject identifiers + email | \`[Region selected at provisioning]\` | No — auth front door; no end-user credentials stored | Conditional (only when SSO enabled) |

> **Not Truehound sub-processors.** The vendor systems Truehound *reads from* on the
> customer's behalf (Datadog, PagerDuty, Jira, …) are the **customer's own**
> integrations, configured with the customer's own credentials. Truehound
> neither contracts with them nor stores their secrets, so they are not part
> of Truehound's DORA sub-contracting chain
> ([\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md),
> [\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md)).

**Sub-processor change notice (Article 30(2)(a)).** Truehound gives **30 days'
prior written notice** before adding or replacing a sub-processor that
processes personal data. The customer may object and, where Truehound cannot
offer a commercially reasonable alternative, terminate the affected
Services without penalty. Subscribe to the Atom feed at
\`/trust/subprocessors.xml\` or the email notice list to receive notice.

---

## Part C — Article 30 mandatory contractual clauses

The DORA Article 30(2)/(3) provisions Truehound commits to, and where each
lives in the contract pack:

| DORA Article 30 provision | Truehound commitment | Where |
|---|---|---|
| 30(2)(a) — Subcontracting + prior notice of changes | 30-day prior notice; right to object + terminate | [MSA](MSA.md) § 2.5, [DPA](DPA.md) § 6 |
| 30(2)(b) — Locations of service + data processing | Customer's selected region only; no cross-region transfer without written authorisation | [MSA](MSA.md) § 2.4 |
| 30(2)(c) — Data protection (availability, authenticity, integrity, confidentiality) | TLS 1.3 in transit; AES-256-GCM at rest; SHA-256 hash-chained, Object-Locked audit log | [SECURITY_ADDENDUM](SECURITY_ADDENDUM.md), [Audit Chain Spec](../specs/AUDIT_CHAIN.md) |
| 30(2)(d) — Access, recovery + return of data on insolvency/termination | Full export (catalog + verifiable audit chain); delete or return within 60 days of termination | [\`../enterprise/DATA_PORTABILITY.md\`](../enterprise/DATA_PORTABILITY.md), [DPA](DPA.md) § 9 |
| 30(2)(e) — Service-level descriptions + updates | Measurable SLA with uptime + support targets and credits | [SLA](SLA.md) |
| 30(2)(f) — Assistance on ICT incidents | Incident notification + cooperation; audit-chain evidence on request | [DPA](DPA.md) § 5, [SLA](SLA.md) |
| 30(2)(g) — Exit strategy + transition period | Export + transition assistance; substitutable architecture | Part A.3 above, [MSA](MSA.md) § 9 |
| 30(3)(a) — Full SLA with precise quantitative + qualitative targets | Yes | [SLA](SLA.md) |
| 30(3)(b) — Notice periods + reporting obligations | Defined notice + breach reporting | [DPA](DPA.md) § 5 |
| 30(3)(c) — Cooperation with competent authorities | Truehound cooperates with the customer's competent authority + resolution authority | [MSA](MSA.md) |
| 30(3)(d) — Termination rights + minimum notice | Per MSA termination terms | [MSA](MSA.md) § 9 |
| 30(3)(e) — Conditions for participation in security awareness / training | Available on request for enterprise engagements | \`[Per order form]\` |

### Audit + inspection right (Article 30(3)(e), 41)

Truehound accepts the customer's, its auditor's, and the **competent
authority's** right to access, inspect, and audit Truehound in relation to the
Services, including on-site where proportionate, per [DPA](DPA.md) § 7.2.
Unrestricted access is supported for the audit chain (independently
verifiable) and the published control mappings; the latest third-party
penetration-test summary is available under NDA.

---

## Part D — How to use this annex

1. **Register owner** at the financial entity copies Part A + Part B rows
   into its DORA Register of Information (RT.0x templates), inserting the
   bracketed identifiers (LEI, contract dates, contract value, CIF
   determination).
2. **Procurement / legal** maps Part C against the executed contract pack
   ([MSA](MSA.md) + [DPA](DPA.md) + [SLA](SLA.md) +
   [SECURITY_ADDENDUM](SECURITY_ADDENDUM.md)).
3. **Vendor-risk** subscribes to the sub-processor change feed
   (\`/trust/subprocessors.xml\`) so the register stays current as the
   chain changes.
4. Engage EU counsel to confirm the CIF determination and any
   entity-specific Article 28 ROI fields before submission.

---

**Related**

- [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md) — contract-grade sub-processor list
- [\`DPA.md\`](DPA.md) § 6–7 — sub-processor + audit terms
- [\`MSA.md\`](MSA.md) § 2.4–2.5, § 9 — residency, sub-processor notice, exit
- [\`SLA.md\`](SLA.md) — Article 30(3)(a) service levels
- [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md) — Article 30(2)(c) measures
- Live register — \`/#/trust/subprocessors\` + feed \`/trust/subprocessors.xml\`
`;export{e as default};