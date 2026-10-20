var e=`# Data Processing Details (GDPR Art. 28(3) Annex)

> **Template: not legal advice.** It expands the [DPA](DPA.md) into the detail
> an Art. 28(3) processing record and a Customer's Art. 30 register typically
> need, and describes the hosted Truehound app as it actually works. A buyer
> should have counsel review it before relying on it.

This Annex forms part of the [DPA](DPA.md). On any conflict, the DPA body and
the SCCs govern. The customer-facing summary is the
[Privacy Policy](https://truehound.io/#/privacy).

## 1. Roles

| Party | Role |
|---|---|
| Customer | Controller |
| Truehound (\`[LEGAL_ENTITY: e.g. Truehound LLC, a [State] limited liability company]\`) | Processor, for the limited Personal Data described below |
| Sub-processors | Sub-processors ([\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md)) |

## 2. How little reaches Truehound

The Truehound app runs in Customer's browser. Customer's access tokens and
catalog data (services, owners, on-call, findings) are stored in that browser,
not on Truehound's servers. Truehound has **no server-side database of
Customer catalog data**. GitHub, GitLab and Bitbucket calls go straight from
the browser to those hosts. PagerDuty and Datadog calls pass through
Truehound's connector (a Cloudflare Worker), which forwards each request and
stores neither the key nor the data. Processing by Truehound is therefore
limited to the items in § 4.

## 3. Subject-matter, nature and purpose of processing

**Subject-matter.** Providing the Truehound app and billing for it.

**Nature of processing.** Transient forwarding of vendor API requests and
Slack digest posts (no storage); receipt of payment confirmation from Stripe;
storage of live-demo form leads; temporary storage of Truth Scan reports of
public GitHub organisations; and, only when AI features are enabled and used,
transient sending of repository facts to Anthropic to produce a draft.

**Purpose.** Providing the Services, confirming payment, answering Customer,
and following up on demo requests. Truehound processes Personal Data only on
Customer's documented instructions, the [MSA](MSA.md) and the
[Terms of Service](https://truehound.io/#/terms).

## 4. Categories of data subjects and Personal Data

| Data subjects | Personal Data | Where it is held |
|---|---|---|
| Customer's account holder and billing contact | Name, email, plan, Stripe checkout session; billing address and payment history held by Stripe | Stripe (card details never reach Truehound) |
| People who request the live demo | First name, last name, email, campaign (utm) tags, page, timestamp | Cloudflare Workers KV |
| People who email Truehound | Their email and its content | Truehound's mailbox |
| People named in repository facts sent for an AI draft (only if AI is enabled and used) | Commit author handles and counts, names appearing in files such as CODEOWNERS | Sent transiently to Anthropic; not stored by Truehound |
| Public GitHub contributors in a Truth Scan report | None by design: handles are withheld from stored reports | Cloudflare Workers KV, 30 days |

Data that stays in Customer's browser (tokens, the workspace, signup details,
the Terms acceptance record) is controlled by Customer and is not processed by
Truehound.

**Special-category data (GDPR Art. 9).** Not intended to be processed.
Customer must not send special-category data, payment-card data, or health
data through the Services.

## 5. Frequency and duration

**Frequency.** On each request that needs it (a pull through the connector, a
payment confirmation, a demo-form submission, an AI request).

**Duration.** For the term of the [MSA](MSA.md) or the Terms of Service, plus
the retention periods in § 6.

## 6. Retention

| Data | Retention |
|---|---|
| Vendor requests and Slack posts through the connector | Not stored |
| Demo-form leads | Until the person asks for deletion, or once no longer needed to follow up |
| Truth Scan reports | 30 days |
| Billing records (Stripe) | As required by tax and accounting law |
| Email | As long as needed to support Customer |
| Data in Customer's browser | Under Customer's control until removed (sign out with "remove my workspace", disconnect, or clear site data) |

## 7. Deletion and return

7.1 On request to \`truehoundhq@truehound.io\`, or on termination, Truehound
deletes the Personal Data it holds about Customer's users within 30 days,
except billing records it must keep by law.

7.2 Customer's catalog data is already in Customer's possession (in its
browser, and as files and merged pull requests in its own repositories), so
there is nothing for Truehound to return.

## 8. Data-subject rights handling

8.1 Truehound assists Customer, taking the nature of processing into account,
to respond to data-subject requests under GDPR Chapter III:

| Right | How Truehound assists |
|---|---|
| Access, portability (Art. 15, 20) | Truehound sends a copy of the Personal Data it holds (§ 4) on request |
| Rectification (Art. 16) | Truehound corrects it on request |
| Erasure (Art. 17) | Truehound deletes it on request, except billing records it must keep by law |
| Restriction, objection (Art. 18, 21) | Truehound acts on Customer's documented instruction |

8.2 Truehound does not respond to data-subject requests directly except on
Customer's instruction or as required by law. Individuals may also write to
\`truehoundhq@truehound.io\` about their own data.

## 9. International transfers

Truehound is based in the United States, and its sub-processors may process
data in the United States and other countries where they operate. Where
Personal Data is transferred outside the EEA, the UK or Switzerland, the SCCs
(EU Implementing Decision 2021/914, Module Two) apply as set out in the
[DPA](DPA.md), with the UK Addendum where the UK GDPR applies. Truehound does
not offer a choice of data region for the hosted app.

## 10. Technical and organisational measures

See the [DPA](DPA.md) and [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md).

---

**Related**

- [\`DPA.md\`](DPA.md): data-processing agreement (this Annex forms part of it)
- [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md): security controls
- [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md): sub-processors
- [Privacy Policy](https://truehound.io/#/privacy)
`;export{e as default};