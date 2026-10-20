var e=`# Pilot Agreement

> **DRAFT — not legal advice; requires counsel review before use.** See [README](README.md). This template governs a time-boxed pilot (paid or no-charge). Fill in the \`{{…}}\` placeholders before signing; have your own counsel review the final form.

This Pilot Agreement (this **"Agreement"**) is entered into as of \`{{EffectiveDate}}\` (the **"Effective Date"**) between Truehound, Inc., a Delaware corporation ("**Truehound**"), and \`{{CustomerName}}\`, a \`{{CustomerJurisdiction}}\` \`{{CustomerEntityType}}\` ("**Customer**"). Truehound and Customer are each a "**Party**" and together the "**Parties**".

The Parties wish to run a time-boxed evaluation of the Truehound engineering operations control plane (the **"Pilot"**). This Agreement governs that Pilot. It incorporates the [MSA](MSA.md) by reference for the duration of the Pilot; where this Agreement and the MSA conflict during the Pilot Term, **this Agreement controls**. The week-by-week structure follows the [Customer Pilot Playbook](../CUSTOMER_PILOT_PLAYBOOK.md).

## 1. Scope of the Pilot

1.1 **Services.** Truehound will provide the Customer access to the Truehound control plane (the **"Services"**) for evaluation only, in the deployment shape selected below.

1.2 **Deployment shape.** \`{{DeploymentShape}}\` — one of: self-hosted-in-VPC (Helm + Terraform) or Truehound Cloud (managed). See [DEPLOYMENT_SELF_HOSTED.md](../DEPLOYMENT_SELF_HOSTED.md) and [DEPLOYMENT_HOSTED.md](../DEPLOYMENT_HOSTED.md).

1.3 **Integrations connected.** Customer will connect at least one ground-truth source. Pilot integrations: \`{{IntegrationsList}}\` (typically PagerDuty + Datadog) plus the catalog source \`{{CatalogSource}}\` (Backstage plugin, Compass importer, or \`catalog-info.yaml\`).

1.4 **Scope of use.** \`{{ScopeOfUse}}\` — the squads, services, or environments in scope (e.g. "2 squads, ~40 services, staging + production read-only"). Use outside this scope is out of scope for the Pilot.

1.5 **Participants.** Customer designates a platform-team lead (\`{{PlatformLead}}\`) and an executive sponsor (\`{{ExecSponsor}}\`).

## 2. Pilot Term

2.1 **Term.** The Pilot runs for \`{{PilotTerm}}\` (default: **four (4) weeks**) from the Effective Date (the **"Pilot Term"**), unless extended by written agreement.

2.2 **Extension.** Either Party may request a one-time extension of up to four weeks in writing. Truehound will not unreasonably withhold an extension where evaluation is materially incomplete through no fault of Customer.

## 3. Success criteria

3.1 The Parties agree the Pilot is successful if the following criteria, adapted from the [Customer Pilot Playbook](../CUSTOMER_PILOT_PLAYBOOK.md), are met by the end of the Pilot Term:

| Week | Milestone | Success criterion |
|---|---|---|
| 1 | Wire ground truth | \`{{Week1Criterion}}\` (default: ≥ 80% ownership coverage) |
| 2 | Light up drift | \`{{Week2Criterion}}\` (default: ≥ 3 actionable findings triaged) |
| 3 | Operationalize the loop | \`{{Week3Criterion}}\` (default: ≥ 1 action proposed → executed → audit-sealed end-to-end) |
| 4 | ROI review | \`{{Week4Criterion}}\` (default: MTTR delta **or** a specific incident caught **or** procurement evidence accepted) |

3.2 **Review.** Truehound and Customer's exec sponsor hold a 30-minute review at the end of the Pilot Term, backed by the [ROI Model](../ROI_MODEL.md). Success criteria are evaluated jointly and in good faith; they inform — but do not bind — a conversion decision.

## 4. Fees

4.1 **Pilot fee.** \`{{PilotFeeOption}}\` — select one:
- **No-charge pilot.** No fee is payable for the Pilot Term. Customer bears its own internal integration cost.
- **Pilot fee.** Customer pays a one-time pilot fee of \`{{PilotFee}}\`, due net 30 from the Effective Date, **creditable in full** against the first-year subscription fee if Customer converts to a paid subscription within 30 days of the Pilot Term ending.

4.2 **Taxes.** Any pilot fee is exclusive of taxes, handled per [MSA](MSA.md) § 4.2.

## 5. Data handling

5.1 **Customer data.** Customer connects real catalog and ground-truth data at its discretion. Customer retains all rights to its data; Truehound's rights are limited to providing the Services during the Pilot Term.

5.2 **Personal Data.** If the Pilot involves Truehound processing Personal Data on Customer's behalf, the [DPA](DPA.md) and its [Data Processing Details](DATA_PROCESSING_DETAILS.md) annex apply and are incorporated by reference. The Parties will execute the DPA before any Personal Data is connected.

5.3 **Security.** The shipped controls in the [Security Addendum](SECURITY_ADDENDUM.md) — tenant isolation, encryption, RBAC, the tamper-evident SHA-256 [audit chain](../specs/AUDIT_CHAIN.md), and two-key approval for state-changing actions — apply during the Pilot.

5.4 **Two-key approval.** State-changing actions affecting Customer's upstream systems require two authenticated approvers during the Pilot, same as production. Truehound does not auto-approve actions.

5.5 **Data return / deletion.** Within 30 days after the Pilot Term ends (and Customer does not convert), Truehound makes Customer's tenant export available via \`GET /api/v1/admin/tenant/export\` and deletes or returns Customer data within 60 days per [DPA](DPA.md) § 9, excluding data under legal hold or WORM retention.

## 6. Service levels during the Pilot

The contractual [SLA](SLA.md) does **not** apply during the Pilot. Truehound provides the Services on a commercially reasonable, best-effort basis, with founder-led support per the [Design Partner Program](../DESIGN_PARTNER_PROGRAM.md) cadence where applicable. The SLA attaches only on conversion to a paid Business or Enterprise subscription.

## 7. Intellectual property

7.1 **Truehound IP.** Truehound retains all rights to the Services, including underlying software, data models, and the audit-chain specification.

7.2 **Customer data.** Customer retains all rights to its data, per § 5.1.

7.3 **Feedback.** Customer may provide feedback during the Pilot. Truehound may use feedback to improve the Services without restriction or obligation, provided no Customer Confidential Information is disclosed. (Reference and logo rights, if any, are addressed in a separate [Design Partner Agreement](DESIGN_PARTNER_AGREEMENT.md), not granted here.)

## 8. Confidentiality

The confidentiality obligations of the [MSA](MSA.md) § 7, or of any executed [Mutual NDA](MUTUAL_NDA.md), apply to information exchanged during the Pilot. The existence and results of the Pilot are Confidential Information of both Parties.

## 9. Warranties and liability

9.1 **As-is.** THE PILOT SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXCEPT AS EXPRESSLY STATED. THE MSA SERVICE WARRANTY (§ 8.2) DOES NOT APPLY TO THE PILOT.

9.2 **Liability cap.** Each Party's aggregate liability arising out of the Pilot is capped at the greater of (a) any pilot fee paid under § 4.1 or (b) US$10,000, except for confidentiality breaches, IP infringement, and willful misconduct or fraud. Neither Party is liable for indirect, incidental, special, consequential, or punitive damages.

## 10. Conversion

10.1 **Path to production.** If the Parties decide to proceed after the Pilot, Customer executes an [Order Form](ORDER_FORM.md) under the [MSA](MSA.md). Any creditable pilot fee (§ 4.1) is applied to the first invoice.

10.2 **Design partner track.** If Customer joins the [Design Partner Program](../DESIGN_PARTNER_PROGRAM.md), the [Design Partner Agreement](DESIGN_PARTNER_AGREEMENT.md) and its pricing lock supersede standard list terms for the agreed period.

10.3 **No obligation.** Neither Party is obligated to proceed beyond the Pilot.

## 11. Term and termination

11.1 This Agreement begins on the Effective Date and ends at the close of the Pilot Term unless extended (§ 2.2), converted (§ 10), or terminated earlier.

11.2 Either Party may terminate the Pilot at any time on \`{{TerminationNotice}}\` (default: **seven (7) days'**) written notice. On termination, § 5.5 (data return / deletion) applies.

11.3 §§ 5 (data handling), 7 (IP), 8 (Confidentiality), 9.2 (Liability cap), and 11 (this section) survive termination.

## 12. General

12.1 **Governing law.** The laws of \`{{GoverningJurisdiction}}\` (default: **Delaware**), per [MSA](MSA.md) § 13.1.

12.2 **Notices.** Notices to Truehound: \`truehoundhq@truehound.io\`. Notices to Customer: \`{{CustomerNoticeEmail}}\`.

12.3 **Entire agreement.** This Agreement, together with the incorporated MSA and (where applicable) DPA, is the entire agreement on the Pilot and supersedes prior discussions about it.

---

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