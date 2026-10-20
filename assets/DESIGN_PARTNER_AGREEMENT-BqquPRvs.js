var e=`# Design Partner Agreement

> **DRAFT — not legal advice; requires counsel review before use.** See [README](README.md). This template formalizes the founder-led design-partner terms described in [docs/DESIGN_PARTNER_PROGRAM.md](../DESIGN_PARTNER_PROGRAM.md). Fill in the \`{{…}}\` placeholders before signing; have your own counsel review the final form.

This Design Partner Agreement (this **"Agreement"**) is entered into as of \`{{EffectiveDate}}\` (the **"Effective Date"**) between Truehound, Inc., a Delaware corporation ("**Truehound**"), and \`{{CustomerName}}\`, a \`{{CustomerJurisdiction}}\` \`{{CustomerEntityType}}\` ("**Design Partner**" or "**Customer**"). Truehound and Customer are each a "**Party**".

This Agreement layers design-partner terms on top of a paid subscription. It incorporates the [MSA](MSA.md), [DPA](DPA.md) (where Personal Data is processed), and [SLA](SLA.md) by reference. The commercial terms (tier, seats, fees, term) are set in the accompanying [Order Form](ORDER_FORM.md). Where this Agreement conflicts with the MSA or Order Form on a design-partner-specific term (pricing lock, reference rights, feedback cadence), **this Agreement controls** for the Design Partner Term.

## 1. Design Partner Term

1.1 **Term.** The design-partner relationship runs for \`{{DesignPartnerTerm}}\` (default: **twenty-four (24) months**) from the Effective Date (the **"Design Partner Term"**), aligned to the Order Form subscription term.

1.2 **Cohort.** Customer is one of a capped cohort of design partners (target: **five**, per [DESIGN_PARTNER_PROGRAM.md](../DESIGN_PARTNER_PROGRAM.md)). Cohort size does not affect Customer's individual terms.

## 2. Pricing lock

2.1 **Discount.** Customer receives a \`{{DiscountPercent}}\` (default: **~50%**) discount off then-current list pricing for the Design Partner Term, as reflected on the [Order Form](ORDER_FORM.md).

2.2 **Lock.** Truehound will not increase Customer's per-unit pricing during the Design Partner Term. List-price changes do not affect Customer's locked rate.

2.3 **Roll-off.** At the end of the Design Partner Term, pricing rolls to then-current standard contract terms. Truehound will give Customer at least 60 days' written notice of the post-term rate before renewal so Customer can decide whether to renew.

2.4 **Billing.** Annual billing, paid up front, **no auto-renewal trap** — renewal is by affirmative agreement, not silent rollover.

## 3. Feedback and roadmap input

3.1 **Cadence.** Customer and Truehound hold a recurring \`{{FeedbackCadence}}\` (default: **bi-weekly, 30-minute**) working call between Customer's platform-team lead and the Truehound founder/lead engineer, plus a shared support channel (founder + lead engineer on the Truehound side, no SDR or relay tier).

3.2 **Roadmap input.** Customer may propose, reprioritize up, or reprioritize down items on the Truehound roadmap (see [docs/ROADMAP.md](../ROADMAP.md)). Truehound commits to **considering and responding** to each input — Truehound does **not** guarantee delivery of any specific feature or by any date. Where Truehound declines an ask, it will explain why.

3.3 **Production use.** Customer agrees to use Truehound under real operational conditions (including in real incidents) and to report defects promptly, so feedback reflects genuine operational pressure.

3.4 **Feedback license.** Truehound may use Customer's feedback, suggestions, and aggregated/de-identified usage data to improve the Services without restriction or obligation, provided Truehound does not disclose Customer's Confidential Information and no Customer is identifiable in any output. Customer retains ownership of its own Confidential Information and data.

## 4. Logo and reference rights

4.1 **Opt-in.** Reference rights are **opt-in and per-artifact**. Nothing in this Agreement grants Truehound the right to use Customer's name, logo, or quotes until Customer approves the specific artifact in writing (email suffices).

4.2 **Scope on approval.** Where Customer approves, Truehound may reference the engagement in case studies, the customer page, sales conversations, and investor decks. Customer may approve in **anonymous mode** (e.g. "a $500M B2B SaaS company") or **named mode**. Customer holds a veto on every artifact and on every public use.

4.3 **Reference calls.** Customer agrees to participate in up to \`{{ReferenceCallsPerYear}}\` (default: **two (2)**) reference calls per year with prospective Truehound customers, subject to mutually convenient scheduling.

4.4 **Withdrawal.** Customer may withdraw a previously granted approval prospectively on written notice; Truehound will cease new uses of the withdrawn material within 30 days. Materials already printed or distributed before withdrawal are not in breach.

## 5. Procurement evidence

Truehound provides the same procurement and compliance evidence to design partners as to enterprise customers: [MSA](MSA.md), [DPA with EU SCCs Module Two](DPA.md), [SLA](SLA.md), [Security Addendum](SECURITY_ADDENDUM.md), [Sub-processor List](SUBPROCESSOR_LIST.md), CycloneDX SBOM, and the offline audit-chain verifier. EU financial-entity partners also receive the [DORA Annex](DORA_ANNEX.md).

## 6. Support and service levels

6.1 **SLA.** The contractual [SLA](SLA.md) at the Order Form tier applies during the Design Partner Term.

6.2 **Founder-led support.** In addition to the SLA, Customer receives the founder-led support cadence in § 3.1 for the Design Partner Term.

## 7. Data, IP, and confidentiality

7.1 **Incorporation.** Data handling, intellectual property, and confidentiality are governed by the [MSA](MSA.md) (§§ 5, 7), [DPA](DPA.md), and [Security Addendum](SECURITY_ADDENDUM.md). This Agreement does not alter those terms except for the feedback license in § 3.4 and the reference rights in § 4.

7.2 **No lock-in.** On exit at the end of the Design Partner Term, Truehound hands over the audit chain, the tenant export (\`GET /api/v1/admin/tenant/export\`), and the integration configuration, per [MSA](MSA.md) § 9.4 and [DPA](DPA.md) § 9. No lock-in tactics.

## 8. Termination

8.1 **For convenience.** Customer may terminate per [MSA](MSA.md) § 9.3 (90 days' notice before renewal). Termination ends the pricing lock and reference rights prospectively; § 4.4 governs already-approved materials.

8.2 **For cause.** Either Party may terminate for uncured material breach per [MSA](MSA.md) § 9.2.

8.3 **Survival.** §§ 3.4 (feedback license), 4.4 (reference withdrawal), 7 (data/IP/confidentiality), and 8 survive termination.

## 9. General

9.1 **Governing law.** The laws of \`{{GoverningJurisdiction}}\` (default: **Delaware**), per [MSA](MSA.md) § 13.1.

9.2 **Notices.** Notices to Truehound: \`truehoundhq@truehound.io\`. Notices to Customer: \`{{CustomerNoticeEmail}}\`.

9.3 **Order of precedence.** For design-partner-specific terms: this Agreement, then the [Order Form](ORDER_FORM.md), then the [MSA](MSA.md). For all other terms: the MSA and Order Form control.

9.4 **Entire agreement.** This Agreement, the Order Form, the MSA, and (where applicable) the DPA and SLA constitute the entire agreement on this subject.

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