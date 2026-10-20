var e=`# Data Processing Details (GDPR Art. 28(3) Annex)

> **Template — not legal advice.** This is a starting point, not a finished
> contract. It expands the [DPA](DPA.md) Annex I into the detail an Art. 28(3)
> processing record and a Customer's Art. 30 register typically need. A buyer
> must have counsel review it before relying on it. Bracketed \`[…]\`
> placeholders are completed at signing.

This Annex forms part of the [DPA](DPA.md). On any conflict, the DPA body and
the SCCs govern in the order set out in [DPA](DPA.md) § 11. It is grounded in
[\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md) and
[\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md);
where this Annex and those engineering docs diverge, the engineering docs
govern.

## 1. Roles

| Party | Role |
|---|---|
| Customer | Controller |
| Truehound, Inc. | Processor |
| Sub-processors | Sub-processors ([\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md)) |

## 2. Subject-matter, nature and purpose of processing

**Subject-matter.** Hosting and operation of the Truehound engineering operations
control plane on Customer's behalf.

**Nature of processing.** Collection, storage, structuring, reconciliation, and
retrieval of operational metadata; sealing of state-changing actions into a
tamper-evident audit chain; transient caching of read-only data fetched from
the Customer's own integrations.

**Purpose.** Providing the control plane; reconciling drift across Customer's
systems-of-record; maintaining the audit chain; supporting Customer's
compliance obligations. Truehound processes Personal Data only on Customer's
documented instructions ([DPA](DPA.md) § 3.2).

## 3. Categories of data subjects

- Customer's authorised users — engineers, SREs, security personnel,
  administrators.
- Individuals named incidentally in Customer-controlled free text (e.g. an
  incident summary or runbook that references a person).

Truehound is a control plane over **operational metadata**; it is not designed to
process Customer's own end-customers' records, and by design holds no PHI/PII
beyond the above ([\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md)).

## 4. Categories of Personal Data

| Category | Examples | Source |
|---|---|---|
| Identity / authentication | Name, email, IdP-provided identifier, application role (admin / operator / viewer) | Customer's IdP / admin |
| Operational attribution | Incident and on-call assignments, action proposer/approver, audit-trail authorship (the \`actor\` on every audited event) | Generated in-product |
| Free-text content | Incident summaries, postmortems, runbook content | Customer-controlled |
| Billing / contact (hosted, direct) | Billing contact name, email, payment metadata | Customer |

**Special-category data (GDPR Art. 9).** Not intended to be processed. Customer
must not submit special-category data, payment-card data, or PHI without the
prior written agreement required by [DPA](DPA.md) Annex I and the
[AUP](ACCEPTABLE_USE.md) § 1.6.

## 5. Frequency and duration of processing

**Frequency.** Continuous for the term of the [MSA](MSA.md) — the control plane
reconciles and audits on an ongoing basis.

**Duration.** For the term of the MSA, plus the deletion/return window in
§ 7 below.

## 6. Retention

Aligned with [\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md):

| Data | Retention |
|---|---|
| Operational tables (catalog, drift, actions, subscriptions) | Current-state; no hard expiry — reconciled continuously and deleted on termination per § 7 |
| Audit chain (per-tenant \`audit\` table + S3 archive) | Configurable per tenant: \`default\` **395 days (13 months)**; \`hipaa\` 6 years; \`sox\` 7 years. Set as \`auditRetentionDays\` in tenant config |
| Browser session / UI prefs | Session JSON is TTL-bound and cleared on sign-out; UI prefs are local to the user's browser |
| Billing records (hosted) | As required by tax/accounting law in the billing jurisdiction |

Audit-chain retention under S3 Object Lock COMPLIANCE mode is WORM — sealed
records cannot be early-deleted before expiry. See § 7 on the erasure tension.

## 7. Deletion, return and the erasure/WORM tension

7.1 On termination, Truehound deletes or returns Personal Data within **60 days**
unless retention is required by law ([DPA](DPA.md) § 9.1, [MSA](MSA.md) § 9.4).

7.2 Customer may export at any time via \`GET /api/v1/admin/tenant/export\`
(the \`atlas-tenant-export/v0.1\` snapshot; Art. 20 portability).

7.3 Operational-data erasure (Art. 17) is available via
\`DELETE /api/v1/admin/gdpr/erasure\`. **Sealed audit-chain records under Object
Lock COMPLIANCE mode cannot be early-deleted** before their retention expiry —
a documented tension between Art. 17 erasure and tamper-evident WORM retention.
Where this conflicts with a regulated-retention obligation, the Parties agree
the precedence on the order form or in writing ([DPA](DPA.md) § 9.3,
[\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md)).

## 8. Data-subject rights handling

8.1 Truehound assists Customer, taking the nature of processing into account, to
respond to data-subject requests under GDPR Chapter III ([DPA](DPA.md) § 8.1):

| Right | How Truehound assists |
|---|---|
| Access / portability (Art. 15, 20) | Tenant export endpoint (§ 7.2) returns the subject's attributable records |
| Rectification (Art. 16) | Operational records are editable in-product by Customer's authorised users; the audit chain records the change rather than overwriting history |
| Erasure (Art. 17) | Operational-data erasure endpoint (§ 7.3), subject to the WORM tension |
| Restriction / objection (Art. 18, 21) | Customer disables the relevant integration or suspends the user; Truehound acts on Customer's documented instruction |

8.2 Truehound does not respond to data-subject requests directly except on
Customer's instruction or as required by law ([DPA](DPA.md) § 8.2).

## 9. International transfers

Where Personal Data is transferred outside the EEA / UK / Switzerland, the SCCs
(EU Implementing Decision 2021/914, Module Two) apply per [DPA](DPA.md) § 7.1
and Annex III, with the UK Addendum where the UK GDPR applies. Data residency is
pinned to the order-form region and does not cross regions without written
authorisation ([MSA](MSA.md) § 2.4). Self-hosted deployments keep all data in
the Customer's region with no transfer to Truehound
([\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md) "Data residency").

## 10. Technical and organisational measures

See [DPA](DPA.md) Annex II and [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md)
for the shipped controls and the planned-vs-delivered distinction.

---

**Related**

- [\`DPA.md\`](DPA.md) — data-processing agreement (this Annex forms part of it)
- [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md) — security controls
- [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md) — sub-processors
- [\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md) — retention / backup / DR
- [\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md) — boundary data flows
`;export{e as default};