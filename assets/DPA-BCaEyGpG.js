var e=`# Data Processing Agreement

> **Template — not legal advice.** Pre-drafted to be acceptable to most EU and US procurement teams without redlines. EU customers must execute this DPA in addition to the [MSA](MSA.md).

This Data Processing Agreement (this **"DPA"**) is entered into as of the Effective Date between Truehound, Inc. ("**Truehound**", a Processor) and \`[Customer Name]\` ("**Customer**", a Controller). It supplements the MSA and governs Truehound's processing of Personal Data on behalf of Customer.

## 1. Definitions

Capitalised terms have the meaning given in the GDPR or in the MSA, with the following additions:

- **GDPR**: Regulation (EU) 2016/679.
- **UK GDPR**: GDPR as incorporated into UK law by the Data Protection Act 2018.
- **SCCs**: the Standard Contractual Clauses approved by the European Commission Implementing Decision (EU) 2021/914, Module Two (Controller-to-Processor).
- **Personal Data**: data within the meaning of GDPR Art. 4(1) processed under this DPA.
- **Personal-Data Breach**: a breach within the meaning of GDPR Art. 4(12).

## 2. Subject-matter and duration

2.1 Truehound processes Personal Data to provide the Services to Customer for the term of the MSA.

2.2 The categories of data subjects, types of Personal Data, and processing purposes are described in **Annex I**.

2.3 The technical and organisational measures Truehound implements are described in **Annex II**.

## 3. Roles and responsibilities

3.1 **Customer is the Controller** of Personal Data submitted to Truehound. Truehound is the Processor.

3.2 Truehound processes Personal Data only on documented instructions from Customer. The MSA, the order form, this DPA, and any in-product configuration constitute Customer's documented instructions.

3.3 Where Truehound determines, in good faith, that an instruction infringes EU data-protection law, Truehound will inform Customer (without limiting Truehound's obligations under § 6.4 of the SCCs).

## 4. Security of processing

4.1 Truehound implements appropriate technical and organisational measures per GDPR Art. 32 and as further described in **Annex II**, including:
- Encryption in transit (TLS 1.3) and at rest (AES-256-GCM);
- SHA-256 hash-chained audit log, mirrored to S3 Object Lock (COMPLIANCE mode) for tamper evidence, per the [Truehound Audit Chain Spec v0.1](../specs/AUDIT_CHAIN.md);
- Two-key approval for state-changing operations;
- Role-based access controls (admin / operator / viewer) and tenant isolation enforced at the Postgres row level (RLS via \`app.tenant_id\`);
- A CycloneDX Software Bill of Materials (SBOM) emitted per release and dependency scanning.

The technical and organisational measures Truehound attests to are limited to those Truehound has shipped. Where a control is planned rather than delivered (for example, production single-sign-on via SAML 2.0 / OIDC, for which the provider interfaces and adapters exist but the server-side assertion/token validation is not yet wired), it is identified as such in **Annex II** and in [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md). Truehound makes no representation that it holds any third-party security certification or attestation (e.g. SOC 2, ISO 27001); see [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md) § "Certifications".

4.2 Personnel authorised to process Personal Data are bound by confidentiality and trained on data-protection obligations.

## 5. Personal-Data Breach notification

5.1 Truehound will notify Customer without undue delay and in any case within 48 hours of becoming aware of a Personal-Data Breach affecting Customer's data.

5.2 The notification will include the nature of the breach, the categories and approximate number of data subjects, the likely consequences, and the measures taken or proposed.

## 6. Sub-processors

6.1 Customer authorises Truehound to engage the sub-processors listed at <https://atlas.example/trust> and enumerated in [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md). Truehound will provide 30 days' written notice before adding a sub-processor; Customer may reasonably object, in which case Truehound will use commercially reasonable efforts to provide an alternative or, if unable, Customer may terminate the affected Services without penalty.

6.2 Truehound remains liable to Customer for the acts and omissions of its sub-processors.

6.3 Truehound's contracts with sub-processors impose data-protection obligations no less protective than those in this DPA.

## 7. International transfers + audit (DORA Art. 31)

7.1 **Transfers from the EEA / UK / Switzerland.** Where Truehound transfers Personal Data outside the EEA / UK / Switzerland, the transfer is governed by the SCCs as set out in **Annex III**, supplemented by the UK Addendum where the UK GDPR applies.

7.2 **Audit rights.** Customer may audit Truehound's compliance with this DPA once per 12-month period on 30 days' written notice, during normal business hours, at Customer's expense, and subject to Truehound's reasonable security and confidentiality requirements. Where Customer is a financial entity subject to DORA, audit cooperation is provided per DORA Art. 31; the audit may be performed by an independent third party.

7.3 **Trust portal.** Truehound's published trust portal at <https://atlas.example/trust> provides a SOC 2 Type II report (when available), the audit-chain export, the SBOM, the CAIQ Lite, and pen-test summary in lieu of repeated audits where Customer's policy permits.

## 8. Data-subject rights

8.1 Truehound will, taking the nature of processing into account, assist Customer by appropriate technical and organisational measures, insofar as possible, to fulfil Customer's obligation to respond to data-subject requests under GDPR Chapter III.

8.2 Truehound will not respond to data-subject requests directly except on Customer's instruction or as required by law.

## 9. Deletion and return

9.1 On termination of the MSA, Truehound will delete or return Personal Data within 60 days, except where retention is required by law.

9.2 Customer may, at any time, export its data via the BFF endpoint \`GET /api/v1/admin/tenant/export\` (the \`atlas-tenant-export/v0.1\` snapshot; GDPR Art. 20 portability). Erasure of operational data is available via \`DELETE /api/v1/admin/gdpr/erasure\` (GDPR Art. 17), subject to § 9.3.

9.3 Where Customer has enabled WORM retention for the audit archive (S3 Object Lock COMPLIANCE mode), sealed audit-chain records cannot be early-deleted before their retention expiry. This is a documented tension between erasure (Art. 17) and tamper-evident retention; the Parties agree the precedence on the order form or in writing. See [\`DATA_PROCESSING_DETAILS.md\`](DATA_PROCESSING_DETAILS.md) and [\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md).

## 10. Liability

The liability provisions of the MSA apply to liability under this DPA, with the proviso that any cap on liability is read consistently with GDPR Art. 82 (data-subject right to compensation) — neither Party is permitted to limit liability owed to data subjects.

## 11. Order of precedence

If there is a conflict between this DPA, the MSA, the order form, and the SCCs, the order of precedence is: (1) SCCs, (2) DPA, (3) MSA, (4) order form.

---

## Annex I — Description of processing

**Categories of data subjects:** Customer's authorised users (engineers, SREs, security personnel, administrators), and Customer's customers' data referenced incidentally through integrations.

**Types of Personal Data:**
- Authentication: name, email, IdP-provided identifiers
- Operational: incident assignments, on-call assignments, audit-trail authorship
- Free-text: incident summaries, runbook content (Customer-controlled)

**Special-category data:** Truehound does not intend to process special-category data under GDPR Art. 9. Customer must not submit such data without prior written agreement.

**Processing purposes:** providing the engineering operations control plane; reconciling drift across Customer's systems-of-record; maintaining the audit chain; supporting Customer's compliance obligations.

**Duration:** for the term of the MSA, plus deletion within 60 days of termination unless retained for legal hold.

## Annex II — Technical and organisational measures

| Measure | Implementation |
|---|---|
| Encryption in transit | TLS 1.3, HSTS preloaded, no TLS 1.0/1.1 |
| Encryption at rest | AES-256-GCM, KMS-wrapped keys |
| Access control | RBAC (admin / operator / viewer); the BFF is the trust boundary (bearer → tenant scope; \`x-admin-token\` → admin scope). Production SSO (SAML 2.0 / OIDC) is **planned** — provider interfaces and adapters ship today; server-side assertion/token validation is the remaining work ([\`../enterprise/SSO_SAML_OIDC.md\`](../enterprise/SSO_SAML_OIDC.md)) |
| Logical isolation | Postgres row-level security pinned by \`set_config('app.tenant_id')\` on every per-tenant query (SQLite per-tenant files in the single-VM shape). A query missing the tenant scope returns zero rows ([\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md)) |
| Audit logging | SHA-256 hash-chained log per spec v0.1, mirrored to S3 Object Lock COMPLIANCE mode; default 395-day retention, configurable per tenant (\`hipaa\` 6yr / \`sox\` 7yr presets — [\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md)) |
| Backup | Deployment-shape dependent: managed-Postgres PITR (Shape B/C) or nightly snapshot (Shape A single VM); the S3 Object Lock archive is the tamper-proof anchor. RTO/RPO per shape in [\`../enterprise/DATA_RETENTION_BACKUP.md\`](../enterprise/DATA_RETENTION_BACKUP.md) |
| Personnel | Confidentiality-bound; least-privilege access; data-protection awareness for personnel handling Personal Data |
| Vulnerability mgmt | CycloneDX SBOM emitted per release; dependency scanning. No third-party penetration-testing programme is claimed; see [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md) |
| Incident response | Coordinated vulnerability disclosure ([\`../SECURITY_DISCLOSURE.md\`](../SECURITY_DISCLOSURE.md)); 48-hour Personal-Data-Breach notification (§ 5) |
| Sub-processor mgmt | Pre-published list ([\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md)); 30-day prior notice for additions; equivalent contractual obligations |

## Annex III — SCCs Module Two (Controller-to-Processor)

The Parties incorporate the SCCs (EU Implementing Decision 2021/914) Module Two with the following selections:

- **Clause 7 (docking clause):** included.
- **Clause 9 (sub-processors):** Option 2 (general written authorisation), with 30 days' notice as set out in § 6.1 of this DPA.
- **Clause 11 (redress):** independent dispute resolution body not opted in.
- **Clause 17 (governing law):** Republic of Ireland.
- **Clause 18 (forum + jurisdiction):** courts of the Republic of Ireland.

The SCCs enter into force on the Effective Date. Annex I.A (parties), Annex I.B (description of processing), Annex II (technical measures), and Annex III (sub-processors list) are completed by reference to this DPA's annexes and the trust portal.

**UK Addendum.** Where the UK GDPR applies, the UK International Data Transfer Addendum to the EU SCCs is incorporated. Mandatory clauses Version B1.0 apply.

---

**Signatures**

Truehound, Inc.
By: ______________________________
Name: \`[Truehound signatory]\`
Title: \`[Title]\`
Date: ___________________________

\`[Customer Name]\`
By: ______________________________
Name: \`[Customer signatory]\`
Title: \`[Title]\`
Date: ___________________________
`;export{e as default};