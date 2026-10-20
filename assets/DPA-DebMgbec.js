var e=`# Data Processing Agreement

> **Template, not legal advice.** For customers who need a data processing agreement alongside the [MSA](MSA.md) (for example under the GDPR or the UK GDPR). It is short because Truehound processes little Personal Data on a customer's behalf: the product runs in the customer's browser and Truehound has no server-side database of customer catalog data. The one founder placeholder is \`[LEGAL_ENTITY]\`, the same value as \`LEGAL_ENTITY\` in \`src/brand.ts\`.

This Data Processing Agreement (this **"DPA"**) is entered into as of the Effective Date between \`[LEGAL_ENTITY: Truehound LLC, a [State] limited liability company]\` (**"Truehound"**, a Processor) and \`[Customer Name]\` (**"Customer"**, a Controller). It supplements the MSA and governs Truehound's processing of Personal Data on Customer's behalf.

## 1. Definitions

Capitalised terms have the meaning given in the GDPR or in the MSA, with these additions:

- **GDPR**: Regulation (EU) 2016/679.
- **UK GDPR**: the GDPR as it forms part of UK law.
- **SCCs**: the Standard Contractual Clauses approved by Commission Implementing Decision (EU) 2021/914, Module Two (Controller to Processor).
- **Personal Data**: personal data within the meaning of GDPR Art. 4(1) that Truehound processes on Customer's behalf under this DPA.
- **Personal-Data Breach**: a breach within the meaning of GDPR Art. 4(12).

## 2. Subject-matter and duration

2.1 Truehound processes Personal Data only to provide the Services, for the term of the MSA.

2.2 The categories of data subjects, types of Personal Data and purposes are in **Annex I**. The measures Truehound applies are in **Annex II**.

2.3 **What Truehound does not process.** Customer's access tokens and keys, and Customer's catalog data (services, owners, on-call, findings), are held in Customer's browser and are not stored by Truehound. PagerDuty and Datadog requests pass through Truehound's connector in transit only: the connector forwards each request and returns the answer without storing the key or the response. Truehound's own records about Customer as a buyer (billing contact, payment records, correspondence) are processed by Truehound as a controller under its [Privacy Policy](https://truehound.io/#/privacy), not under this DPA.

## 3. Roles and responsibilities

3.1 Customer is the Controller and Truehound is the Processor of Personal Data processed under this DPA.

3.2 Truehound processes Personal Data only on Customer's documented instructions. The MSA, the order form, this DPA and Customer's in-product choices (for example switching on AI features or the Slack digest) are those instructions.

3.3 Truehound will tell Customer if, in its opinion, an instruction infringes data protection law.

## 4. Security of processing

4.1 Truehound applies appropriate technical and organisational measures under GDPR Art. 32, described in **Annex II**. Truehound makes no claim to hold any third-party certification or attestation (such as SOC 2 or ISO 27001).

4.2 People authorised to process Personal Data are bound by confidentiality.

## 5. Personal-Data Breach notification

5.1 Truehound will notify Customer without undue delay, and in any case within 72 hours, after becoming aware of a Personal-Data Breach affecting Personal Data processed under this DPA.

5.2 The notice will describe the nature of the breach, the categories and approximate number of data subjects and records concerned, the likely consequences, and the measures taken or proposed, as far as then known.

## 6. Sub-processors

6.1 Customer authorises the sub-processors listed in [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md). Truehound will give 30 days' notice by email before adding or replacing one. If Customer reasonably objects and Truehound cannot offer a reasonable alternative, Customer may terminate the affected order form and receive a refund of prepaid fees for the remaining term.

6.2 Truehound remains liable to Customer for its sub-processors' performance of their data protection obligations.

6.3 Truehound relies on each sub-processor's published data processing terms, which impose data protection obligations appropriate to the processing.

## 7. International transfers and audit

7.1 **Transfers.** Truehound and its sub-processors may process Personal Data in the United States. Where Personal Data is transferred from the EEA, the UK or Switzerland to a country without an adequacy decision, the SCCs in **Annex III** apply, with the UK Addendum where the UK GDPR applies.

7.2 **Information and audit.** Truehound will answer Customer's reasonable written questions about its compliance with this DPA and make available the information necessary to demonstrate it. Customer may audit once in any 12-month period, on 30 days' notice, at its own cost, and subject to reasonable confidentiality terms; a regulated Customer may have the audit performed by an independent third party.

## 8. Data-subject rights

8.1 Taking the nature of the processing into account, Truehound will help Customer respond to data-subject requests. Because most Customer data is held in Customer's own browser, Customer can usually act on a request directly (for example by removing a workspace or signing out).

8.2 Truehound will not respond to a data-subject request about Customer's data directly, except on Customer's instruction or where the law requires.

## 9. Deletion and return

9.1 On termination of the MSA, or earlier on Customer's request by email to \`truehoundhq@truehound.io\`, Truehound will delete Personal Data it holds under this DPA within 30 days, except where the law requires it to be kept.

9.2 Data held in Customer's browser is under Customer's control and is removed by Customer (signing out, disconnecting a source, or clearing site data).

## 10. Liability

The MSA's liability provisions apply to this DPA. Nothing in this DPA limits liability owed to data subjects under GDPR Art. 82.

## 11. Order of precedence

If this DPA, the MSA, an order form and the SCCs conflict, the order of precedence is: (1) the SCCs, (2) this DPA, (3) the MSA, (4) the order form.

---

## Annex I: Description of processing

**Data subjects:** Customer's users; people named in Customer's repositories and tools (for example commit authors, code owners and on-call responders) whose details are included in a request Customer chooses to send through Truehound.

**Types of Personal Data processed under this DPA:**

- **AI requests, only if AI features are enabled and used:** the repository facts needed for the request, which may include commit author handles, code-owner handles and file contents, sent through Truehound's connector to Anthropic. Not stored by Truehound's connector.
- **Connector transit:** PagerDuty and Datadog responses (which may include responder names and emails) and Slack digest messages pass through the connector in transit and are not stored.
- **Product analytics, only if enabled:** page views and clicks with on-screen text masked.

**Special-category data:** not intended. Customer will not send it.

**Purpose:** providing the Services.

**Duration:** transit only for connector requests; otherwise for the term of the MSA, then deletion under Section 9.

## Annex II: Technical and organisational measures

| Measure | Implementation |
|---|---|
| Data minimisation | Tokens, keys and catalog data stay in Customer's browser; Truehound runs no server-side customer catalog database |
| Encryption in transit | HTTPS for the site, the connector and every provider call |
| Secrets | Customer's vendor keys are forwarded per request and never stored or logged by the connector; Truehound's own secrets (Stripe, Anthropic) are encrypted Cloudflare Worker secrets and never sent to the browser |
| Least privilege | Customer chooses the scope of each token; read-only tokens work for everything except opening pull requests |
| Change control in Customer systems | Changes only as pull requests that Customer merges; no pushes to default branches, no merges |
| Abuse limits | Connector routes validate their input; the demo-lead and Truth Scan routes are rate limited; the Slack relay accepts only Slack incoming-webhook addresses |
| Vulnerability reporting | Coordinated disclosure policy at <https://truehound.io/#/security-disclosure> |
| Sub-processors | Published list ([\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md)) with 30 days' notice of changes |

## Annex III: SCCs Module Two (Controller to Processor)

The Parties incorporate the SCCs, Module Two, with these selections:

- **Clause 7 (docking clause):** included.
- **Clause 9 (sub-processors):** Option 2 (general written authorisation), with 30 days' notice as in Section 6.1.
- **Clause 11 (redress):** the optional language is not used.
- **Clause 17 (governing law):** the law of the Republic of Ireland.
- **Clause 18 (forum):** the courts of the Republic of Ireland.

Annex I.A (parties) is completed by the signature blocks below; Annex I.B by Annex I of this DPA; Annex II by Annex II of this DPA; Annex III by [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md).

**UK Addendum.** Where the UK GDPR applies, the UK International Data Transfer Addendum to the SCCs is incorporated.

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