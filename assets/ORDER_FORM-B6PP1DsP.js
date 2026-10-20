var e=`# Order Form

> **DRAFT — not legal advice; requires counsel review before use.** See [README](README.md). This is the commercial order form / statement of work that sits under the [MSA](MSA.md). Fill in the \`{{…}}\` placeholders before signing; have your own counsel review the final form.

This Order Form (this **"Order Form"**) is entered into as of \`{{EffectiveDate}}\` (the **"Effective Date"**) between Truehound, Inc., a Delaware corporation ("**Truehound**"), and \`{{CustomerName}}\` ("**Customer**"). It is governed by and incorporated into the Master Services Agreement between the Parties dated \`{{MSADate}}\` (the **"MSA"**). Capitalized terms not defined here have the meaning given in the [MSA](MSA.md). Where this Order Form and the MSA conflict on a commercial term stated here, **this Order Form controls**.

This Order Form is **Order Form \`{{OrderFormNumber}}\`** referenced by [MSA](MSA.md) § 1.2.

## 1. Product and tier

| Item | Value |
|---|---|
| Product | Truehound engineering operations control plane |
| Subscription tier | \`{{Tier}}\` — one of: Free, Team, Business, Enterprise (per MSA § 1.3) |
| Deployment shape | \`{{DeploymentShape}}\` — self-hosted-in-VPC (Helm + Terraform) or Truehound Cloud (managed) |
| Data residency region | \`{{Region}}\` (default: us-east-1; eu-west-1 for EU tenants; ap-southeast-1 for APAC — per MSA § 2.4) |

## 2. Seats and usage

| Item | Value |
|---|---|
| Seat count / commit | \`{{SeatCount}}\` |
| Usage commit (if applicable) | \`{{UsageCommit}}\` — e.g. tracked services, integration adapters, MCP/API call volume |
| Tier caps | As published at <https://atlas.example/welcome#pricing>, subject to MSA § 1.3 |
| Overage handling | \`{{OverageTerms}}\` (default: overage billed monthly at the per-unit list rate, or true-up at renewal) |

## 3. Term

| Item | Value |
|---|---|
| Subscription term | \`{{Term}}\` (default: **12 months**) |
| Start date | \`{{StartDate}}\` |
| End date | \`{{EndDate}}\` |
| Renewal | \`{{RenewalTerms}}\` (default: renews for successive 12-month terms unless either Party gives notice per MSA § 9.3 — 90 days before renewal) |

## 4. Fees

| Item | Value |
|---|---|
| Annual subscription fee | \`{{AnnualFee}}\` |
| Discount (if any) | \`{{Discount}}\` — e.g. design-partner ~50% lock per [Design Partner Agreement](DESIGN_PARTNER_AGREEMENT.md) |
| Pilot credit applied (if any) | \`{{PilotCredit}}\` — creditable pilot fee per [Pilot Agreement](PILOT_AGREEMENT.md) § 4.1 |
| One-time / professional services | \`{{ProServicesFee}}\` — e.g. self-hosted deploy assistance, migration |
| Total contract value (TCV) | \`{{TCV}}\` |

4.1 Fees are exclusive of taxes (MSA § 4.2). Truehound invoices annually in advance unless stated otherwise here.

4.2 **Marketplace.** If purchased via AWS / Azure / GCP / Atlassian Marketplace, billing flows through that marketplace per MSA § 4.4. Marketplace: \`{{Marketplace}}\` (default: none / direct).

## 5. Payment terms

| Item | Value |
|---|---|
| Billing frequency | \`{{BillingFrequency}}\` (default: annual, in advance) |
| Payment terms | \`{{PaymentTerms}}\` (default: net 30 from invoice date — MSA § 4.3) |
| Payment method | \`{{PaymentMethod}}\` (e.g. ACH / wire / marketplace) |
| Purchase order required | \`{{PORequired}}\` (yes/no); PO number: \`{{PONumber}}\` |

## 6. Statement of work (if applicable)

\`{{SOWScope}}\` — describe any in-scope professional services beyond standard onboarding (e.g. self-hosted deployment walkthrough per [DEPLOYMENT_SELF_HOSTED.md](../DEPLOYMENT_SELF_HOSTED.md), catalog importer setup, custom adapter). Standard onboarding and the [Customer Pilot Playbook](../CUSTOMER_PILOT_PLAYBOOK.md) ramp are included at no additional fee unless stated above.

| Deliverable | Owner | Target date | Acceptance |
|---|---|---|---|
| \`{{Deliverable1}}\` | \`{{Owner1}}\` | \`{{Date1}}\` | \`{{Acceptance1}}\` |
| \`{{Deliverable2}}\` | \`{{Owner2}}\` | \`{{Date2}}\` | \`{{Acceptance2}}\` |

## 7. Service levels and security

7.1 **SLA.** The [SLA](SLA.md) applies at the \`{{Tier}}\` tier (Business / Enterprise tiers only; Free and Team receive commercially reasonable effort).

7.2 **Security and data processing.** The [Security Addendum](SECURITY_ADDENDUM.md) applies. If Truehound processes Personal Data, the [DPA](DPA.md) and its [Data Processing Details](DATA_PROCESSING_DETAILS.md) annex apply. EU financial entities: the [DORA Annex](DORA_ANNEX.md) applies.

7.3 **Tenant-specific terms.** \`{{TenantSpecificTerms}}\` (default: none — list any negotiated deviations from the templates here, per MSA § 1.2(e)).

## 8. Integrations enabled at start

\`{{IntegrationsList}}\` — the ordered integration set enabled for this tenant (per the integration catalog in [docs/INTEGRATIONS.md](../INTEGRATIONS.md)). Catalog source: \`{{CatalogSource}}\`.

## 9. Notices and contacts

| Role | Truehound | Customer |
|---|---|---|
| Commercial / billing | \`truehoundhq@truehound.io\` | \`{{CustomerBillingContact}}\` |
| Legal notices | \`truehoundhq@truehound.io\` | \`{{CustomerNoticeEmail}}\` |
| Technical / support | per [SLA](SLA.md) § 3.2 | \`{{CustomerTechContact}}\` |

---

By signing, each Party agrees to this Order Form and reaffirms the [MSA](MSA.md). This Order Form, the MSA, and the documents incorporated by the MSA's entire-agreement clause (§ 13.5) are the entire agreement on this subject.

**Signatures**

Truehound, Inc.
By: ______________________________
Name: \`{{AtlasSignatory}}\`
Title: \`{{AtlasSignatoryTitle}}\`
Date: ___________________________

\`{{CustomerName}}\`
By: ______________________________
Name: \`{{CustomerSignatory}}\`
Title: \`{{CustomerSignatoryTitle}}\`
Date: ___________________________

---

> **DRAFT — not legal advice; requires counsel review before use.**
`;export{e as default};