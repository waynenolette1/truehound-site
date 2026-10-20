var e=`# Master Services Agreement

> **Template, not legal advice.** See [README](README.md). This is the signed-contract form of the public [Terms of Service](https://truehound.io/#/terms), for customers who want a countersigned agreement or an [Order Form](ORDER_FORM.md). \`[Bracketed]\` items are filled in at signing. The one founder placeholder is \`[LEGAL_ENTITY]\`, the same value as \`LEGAL_ENTITY\` in \`src/brand.ts\`.

This Master Services Agreement (this **"Agreement"**) is entered into as of \`[Effective Date]\` (the **"Effective Date"**) between \`[LEGAL_ENTITY: Truehound LLC, a [State] limited liability company]\` (**"Truehound"**) and \`[Customer Name]\`, a \`[Customer Jurisdiction]\` \`[Customer Entity Type]\` (**"Customer"**). Truehound and Customer are each a **"Party"** and together the **"Parties"**.

## 1. Services

1.1 **Services.** Truehound provides the Truehound service catalog product described at <https://truehound.io> and on the order form (the **"Services"**): it reads the code hosts and tools Customer connects, shows which services are missing an owner, an on-call rotation or a tier, and drafts fixes for Customer to review.

1.2 **Order forms.** Each order form references this Agreement and states (a) the plan, (b) the number of services covered, (c) the term and billing period, (d) the fees, and (e) any Customer-specific terms. Pricing is by services covered, never per seat.

1.3 **Plans.** Current plans and prices are published at <https://truehound.io/#/pricing>: Starter ($50 a month or $500 a year, up to 50 services); Catalog kept true ($500, $1,500 or $4,500 a month for up to 150, 450 or 1,500 services, or ten times the monthly price a year; above 1,500 services, $3 per service per month); and Compass migration, done for you (a one-time fee of $6,000, $12,500 or $29,000). The order form controls the plan Customer buys.

## 2. Truehound obligations

2.1 **Performance.** Truehound will provide the Services with reasonable skill and care and in line with applicable law. Availability is on a best-effort basis as described in the [SLA](SLA.md).

2.2 **Where Customer data lives.** The Services run in Customer's browser. Customer's GitHub, GitLab and Bitbucket tokens and Customer's catalog data are stored in that browser, and calls to those hosts go directly from the browser. PagerDuty and Datadog calls pass through Truehound's connector (a Cloudflare Worker), which forwards each request with the key Customer supplies and stores neither the key nor the response. Truehound does not operate a server-side database of Customer's catalog data.

2.3 **Changes to Customer's repositories.** Truehound never pushes to a default branch and never merges. Every change the Services propose is a pull request on a new branch that Customer reviews and merges. Autopilot is off by default, available on paid plans only, and switched on by a Customer admin; when on, its only automatic action is opening a pull request that adds a \`catalog-info.yaml\` file derived from Customer's CODEOWNERS file, after a veto window Customer sets, with a rollback. Every other fix is a draft that a person approves.

2.4 **Data location.** Because Customer data stays in Customer's browser, it is located wherever Customer uses the Services. The limited data Truehound does receive (Section 2.2 and the [Privacy Policy](https://truehound.io/#/privacy)) is processed by the providers in the [Sub-processor List](SUBPROCESSOR_LIST.md), in the United States and other countries where they operate.

2.5 **Sub-processors.** Truehound's sub-processors are listed in [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md). Truehound will give Customer 30 days' notice by email before adding one that processes Customer Personal Data; if Customer reasonably objects, Customer may terminate the affected order form and receive a refund of prepaid fees for the remaining term.

## 3. Customer obligations

3.1 **Authorised access.** Customer will connect only repositories, organisations and tools it is authorised to access, using tokens and keys it is entitled to use, and is responsible for the activities of its users. Customer will not (a) reverse engineer the Services except where the law allows, (b) use the Services to build a competing service, or (c) get around plan limits.

3.2 **Review.** Customer reviews every pull request the Services open and decides whether to merge it. Customer is responsible for the content of its repositories and for complying with the terms of the providers it connects.

3.3 **Acceptable use.** Customer's use of the Services is subject to the [Acceptable Use Policy](ACCEPTABLE_USE.md), incorporated by reference.

## 4. Fees and payment

4.1 **Fees.** Customer pays the fees on the order form, in advance for each billing period, through Stripe or by invoice as the order form states.

4.2 **Renewal and cancellation.** Subscriptions renew automatically for periods of the same length until cancelled. Customer may cancel at any time, with no cancellation fee, self-serve through the Stripe customer portal ("Cancel or manage subscription" in the app, or <https://truehound.io/#/cancel>) or by email to \`truehoundhq@truehound.io\`; cancellation takes effect at the end of the paid period. Fees for a partial period are not refunded except as stated in this Agreement or required by law. Truehound gives at least 30 days' notice by email of a price change, which applies from the next renewal.

4.3 **Compass migration.** A 50% deposit books the migration; the balance is due when Customer accepts the dry run. The deposit is refundable until Customer accepts the dry run. If your Compass migration is not done before your renewal date, the migration fee is refunded.

4.4 **Taxes.** Fees exclude taxes. Customer pays applicable sales, use, VAT or withholding taxes, other than taxes on Truehound's income.

4.5 **Invoices.** Where Truehound invoices, invoices are due within 30 days unless the order form states otherwise.

## 5. Intellectual property

5.1 **Truehound IP.** Truehound owns the Services, including the software and its design, and grants Customer a non-exclusive, non-transferable right to use them during the term.

5.2 **Customer data.** Customer owns its data, its repositories and the drafts it accepts. Customer permits Truehound to process Customer data only to provide the Services.

5.3 **Feedback.** Truehound may use feedback Customer chooses to give without obligation.

## 6. Regulated customers

6.1 **Information.** On request, Truehound will give a regulated Customer (for example an EU financial entity subject to DORA) the factual information it needs for its third-party register, including the [DORA Annex](DORA_ANNEX.md).

6.2 **Cooperation.** Truehound will cooperate in good faith with reasonable audit or regulator requests about the Services, on reasonable notice. Any further commitments are set on the order form.

## 7. Confidentiality

7.1 **Definition.** "Confidential Information" means non-public information one Party discloses to the other under this Agreement that is marked or reasonably understood as confidential.

7.2 **Obligations.** Each Party protects the other's Confidential Information with at least reasonable care and uses it only for this Agreement.

7.3 **Exclusions.** Confidential Information does not include information that (a) is or becomes public through no fault of the receiving Party, (b) the receiving Party already had, (c) is independently developed, or (d) must be disclosed by law (with notice where allowed).

## 8. Warranties and disclaimers

8.1 **Mutual.** Each Party has authority to enter this Agreement and will comply with applicable law.

8.2 **Disclaimer.** Except as expressly stated, the Services are provided "as is" and "as available", and Truehound disclaims all other warranties, including merchantability, fitness for a particular purpose and non-infringement. Truehound does not warrant that the Services are uninterrupted or error-free, or that findings and drafts are complete or correct.

## 9. Term and termination

9.1 **Term.** This Agreement runs from the Effective Date until all order forms have ended.

9.2 **For cause.** Either Party may terminate for a material breach not cured within 30 days of written notice.

9.3 **Cancellation.** Customer may cancel any subscription as described in Section 4.2.

9.4 **Effect.** On termination, Customer's data remains in Customer's browser and pull requests already opened remain in Customer's repositories under Customer's control. Truehound deletes the limited data it holds about Customer on request, except records it must keep by law. Accrued fees remain due. If Truehound terminates without cause, it refunds prepaid fees for the remaining term.

## 10. Indemnification

10.1 **By Truehound.** Truehound will defend Customer against third-party claims that the Services, as provided by Truehound, infringe that third party's intellectual property rights, and pay damages finally awarded or agreed in settlement.

10.2 **By Customer.** Customer will defend Truehound against third-party claims arising from repositories or tools Customer connected without authorisation, or from Customer's breach of the Acceptable Use Policy, and pay damages finally awarded or agreed in settlement.

10.3 **Procedure.** The indemnified Party promptly notifies the indemnifying Party, gives it control of the defence and settlement, and cooperates at its expense. No settlement may admit fault for the indemnified Party without its consent.

## 11. Limitation of liability

11.1 **Cap.** Except for Customer's payment obligations, a Party's fraud or wilful misconduct, and liability that cannot be limited by law, each Party's total liability under this Agreement is limited to the fees Customer paid in the 12 months before the event giving rise to the claim.

11.2 **Excluded damages.** Neither Party is liable for indirect, incidental, special, consequential or punitive damages, or lost profits, revenue or data.

## 12. AI features

12.1 Two optional features use an AI model (Anthropic's Claude): "Investigate with AI" and "Draft the fix with AI". They are labelled, run only when AI is enabled and a person clicks them, and send through Truehound's connector only the repository facts the request needs; Customer's tokens are never sent. Anthropic is a sub-processor for these requests. Truehound does not use Customer data to train AI models.

12.2 AI output can be wrong or incomplete and is always a draft for Customer to review before acting. Autopilot's automatic action is decided by fixed rules, not by AI.

## 13. General

13.1 **Governing law.** This Agreement is governed by the laws of the state in which Truehound is organized (\`[LEGAL_ENTITY state]\`), without regard to conflict-of-laws rules.

13.2 **Disputes.** The Parties will try in good faith to resolve a dispute for 30 days before starting proceedings, then submit to the state or federal courts located in that state.

13.3 **Notices.** Notices to Truehound go to \`truehoundhq@truehound.io\`; notices to Customer go to the email on the order form.

13.4 **Assignment.** Neither Party may assign without consent, except to a successor in a merger or sale of substantially all of its business.

13.5 **Entire agreement.** This Agreement, its order forms, and where they apply the [DPA](DPA.md) and the [SLA](SLA.md), are the entire agreement on this subject. A signed order form controls over this Agreement on the commercial terms it states; this Agreement controls over the public Terms of Service.

13.6 **Survival.** Sections 4 (for fees owed), 5, 7, 8.2, 9.4, 10, 11 and 13 survive termination.

---

**Signatures**

\`[LEGAL_ENTITY]\`
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