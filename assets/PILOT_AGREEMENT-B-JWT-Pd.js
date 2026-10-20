var e=`# Pilot Agreement

> **Template: not legal advice; requires counsel review before use.** See [README](README.md). This template governs a time-boxed pilot agreed by order form. Truehound has no free tier: the standard way to start is a paid Starter or Catalog kept true plan, and anyone can try the free live demo on fictional data first. Fill in the \`{{…}}\` placeholders before signing; have your own counsel review the final form.

This Pilot Agreement (this **"Agreement"**) is entered into as of \`{{EffectiveDate}}\` (the **"Effective Date"**) between Truehound (\`[LEGAL_ENTITY: e.g. Truehound LLC, a [State] limited liability company]\`) ("**Truehound**"), and \`{{CustomerName}}\`, a \`{{CustomerJurisdiction}}\` \`{{CustomerEntityType}}\` ("**Customer**"). Truehound and Customer are each a "**Party**" and together the "**Parties**".

The Parties wish to run a time-boxed evaluation of Truehound, which reads the code hosts and tools Customer connects, shows services missing an owner, an on-call rotation or a tier, and drafts fixes as pull requests (the **"Pilot"**). This Agreement governs that Pilot. It incorporates the [MSA](MSA.md) by reference for the duration of the Pilot; where this Agreement and the MSA conflict during the Pilot Term, **this Agreement controls**. The week-by-week structure follows the [Customer Pilot Playbook](../CUSTOMER_PILOT_PLAYBOOK.md).

## 1. Scope of the Pilot

1.1 **Services.** Truehound will give Customer access to the Truehound app (the **"Services"**) for evaluation only.

1.2 **How it runs.** The Services run in Customer's browser. Customer's access tokens and catalog data stay in that browser; Truehound has no server-side database of Customer's catalog. GitHub, GitLab and Bitbucket calls go straight from the browser to those hosts. PagerDuty and Datadog calls pass through Truehound's connector (a Cloudflare Worker), which forwards each request and stores neither the key nor the data. Any other deployment shape (for example a self-hosted installation) is available only if stated on an order form: \`{{DeploymentShape}}\` (default: **the hosted app at https://truehound.io**).

1.3 **Integrations connected.** Customer will connect at least one code host. Pilot integrations: \`{{IntegrationsList}}\` (typically GitHub, plus PagerDuty or Datadog if Customer wishes) and, optionally, a catalog export to import \`{{CatalogSource}}\` (Backstage, Compass, Port, Cortex or OpsLevel export, or \`catalog-info.yaml\`).

1.4 **Scope of use.** \`{{ScopeOfUse}}\`: the organisations, teams or services in scope (for example "one GitHub organisation, about 40 services"). Use outside this scope is out of scope for the Pilot.

1.5 **Participants.** Customer designates a platform-team lead (\`{{PlatformLead}}\`) and an executive sponsor (\`{{ExecSponsor}}\`).

## 2. Pilot Term

2.1 **Term.** The Pilot runs for \`{{PilotTerm}}\` (default: **four (4) weeks**) from the Effective Date (the **"Pilot Term"**), unless extended by written agreement.

2.2 **Extension.** Either Party may request a one-time extension of up to four weeks in writing. Truehound will not unreasonably withhold an extension where evaluation is materially incomplete through no fault of Customer.

## 3. Success criteria

3.1 The Parties agree the Pilot is successful if the following criteria, adapted from the [Customer Pilot Playbook](../CUSTOMER_PILOT_PLAYBOOK.md), are met by the end of the Pilot Term:

| Week | Milestone | Success criterion |
|---|---|---|
| 1 | Connect the sources | \`{{Week1Criterion}}\` (default: ownership coverage measured for every in-scope repository) |
| 2 | Find the gaps | \`{{Week2Criterion}}\` (default: at least 3 actionable findings triaged) |
| 3 | Fix through pull requests | \`{{Week3Criterion}}\` (default: at least 1 fix opened as a pull request and merged by Customer) |
| 4 | Value review | \`{{Week4Criterion}}\` (default: a measured coverage improvement, **or** a specific gap caught, **or** procurement evidence accepted) |

3.2 **Review.** Truehound and Customer's executive sponsor hold a 30-minute review at the end of the Pilot Term, backed by the [ROI Model](../ROI_MODEL.md). Success criteria are evaluated jointly and in good faith; they inform, but do not bind, a conversion decision.

## 4. Fees

4.1 **Pilot fee.** \`{{PilotFee}}\`, paid up front, unless the order form states otherwise. The pilot fee is **creditable in full** against the first subscription payment if Customer moves to a paid plan within 30 days after the Pilot Term ends. For reference, the list plans are: Starter at $50 a month or $500 a year for up to 50 services; Catalog kept true at $500, $1,500 or $4,500 a month for up to 150, 450 or 1,500 services (or ten times the monthly price a year, and $3 per service per month above 1,500 services); and the Compass migration at a one-time $6,000, $12,500 or $29,000. Pricing is by services, never per seat.

4.2 **Taxes.** Any pilot fee is exclusive of taxes, handled per the [MSA](MSA.md).

## 5. Data handling

5.1 **Customer data.** Customer connects real repositories and tools at its discretion, using tokens it is authorised to use. Customer retains all rights to its data; Truehound's rights are limited to providing the Services during the Pilot Term.

5.2 **Personal Data.** Truehound receives very little Personal Data (account and billing contact details, and anything Customer emails). If the Pilot involves Truehound processing Personal Data on Customer's behalf, the [DPA](DPA.md) and its [Data Processing Details](DATA_PROCESSING_DETAILS.md) annex apply and are incorporated by reference.

5.3 **Security.** The controls described in the [Security Addendum](SECURITY_ADDENDUM.md) apply during the Pilot.

5.4 **Changes to Customer's repositories.** Truehound never pushes to a default branch and never merges. Every change it proposes arrives as a pull request on a new branch, which Customer reviews and decides whether to merge. Autopilot is off by default; if an admin on a paid plan switches it on, the only change it makes by itself is opening a pull request that adds a \`catalog-info.yaml\` built from CODEOWNERS, after a veto window Customer sets, with a rollback.

5.5 **Data at the end.** Customer's workspace lives in Customer's browser and stays under Customer's control; Customer can remove it at any time by signing out with "remove my workspace", disconnecting sources, or clearing site data. Pull requests already opened stay in Customer's repositories. Truehound deletes any Personal Data it holds about Customer's users on request to \`truehoundhq@truehound.io\`, except billing records it must keep by law.

## 6. Service levels during the Pilot

No uptime or response-time commitment applies during the Pilot. Truehound provides the Services on a commercially reasonable, best-effort basis, with founder-led support by email at \`truehoundhq@truehound.io\`, per the [Design Partner Program](../DESIGN_PARTNER_PROGRAM.md) cadence where applicable. See the [SLA](SLA.md).

## 7. Intellectual property

7.1 **Truehound IP.** Truehound retains all rights to the Services, including the underlying software and design.

7.2 **Customer data.** Customer retains all rights to its data, per § 5.1, and to every pull request and file the Services draft once Customer accepts it.

7.3 **Feedback.** Customer may provide feedback during the Pilot. Truehound may use feedback to improve the Services without restriction or obligation, provided no Customer Confidential Information is disclosed. (Reference and logo rights, if any, are addressed in a separate [Design Partner Agreement](DESIGN_PARTNER_AGREEMENT.md), not granted here.)

## 8. Confidentiality

The confidentiality obligations of the [MSA](MSA.md), or of any executed [Mutual NDA](MUTUAL_NDA.md), apply to information exchanged during the Pilot. The existence and results of the Pilot are Confidential Information of both Parties.

## 9. Warranties and liability

9.1 **As-is.** THE PILOT SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXCEPT AS EXPRESSLY STATED.

9.2 **Liability cap.** Each Party's aggregate liability arising out of the Pilot is capped at the fees Customer paid for the Pilot, except for confidentiality breaches and wilful misconduct or fraud. Neither Party is liable for indirect, incidental, special, consequential, or punitive damages.

## 10. Conversion

10.1 **Path to production.** If Customer decides to proceed after the Pilot, Customer buys a plan (online, or by an [Order Form](ORDER_FORM.md) under the [MSA](MSA.md)). Any creditable pilot fee (§ 4.1) is applied to the first payment.

10.2 **Design partner track.** If Customer joins the [Design Partner Program](../DESIGN_PARTNER_PROGRAM.md), the [Design Partner Agreement](DESIGN_PARTNER_AGREEMENT.md) and its pricing terms apply for the agreed period.

10.3 **No obligation.** Neither Party is obligated to proceed beyond the Pilot.

## 11. Term and termination

11.1 This Agreement begins on the Effective Date and ends at the close of the Pilot Term unless extended (§ 2.2), converted (§ 10), or terminated earlier.

11.2 Either Party may terminate the Pilot at any time on \`{{TerminationNotice}}\` (default: **seven (7) days'**) written notice. On termination, § 5.5 applies.

11.3 §§ 5 (data handling), 7 (IP), 8 (Confidentiality), 9.2 (Liability cap), and 11 (this section) survive termination.

## 12. General

12.1 **Governing law.** The laws of the state in which Truehound is organized (\`[LEGAL_ENTITY state]\`), per the [MSA](MSA.md).

12.2 **Notices.** Notices to Truehound: \`truehoundhq@truehound.io\`. Notices to Customer: \`{{CustomerNoticeEmail}}\`.

12.3 **Entire agreement.** This Agreement, together with the incorporated MSA and (where applicable) DPA, is the entire agreement on the Pilot and supersedes prior discussions about it.

---

**Signatures**

Truehound (\`[LEGAL_ENTITY]\`)
By: ______________________________
Name: \`{{TruehoundSignatory}}\`
Title: \`{{TruehoundSignatoryTitle}}\`
Date: ___________________________

\`{{CustomerName}}\`
By: ______________________________
Name: \`{{CustomerSignatory}}\`
Title: \`{{CustomerSignatoryTitle}}\`
Date: ___________________________

---

> **Template: not legal advice; requires counsel review before use.**
`;export{e as default};