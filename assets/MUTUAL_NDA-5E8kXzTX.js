var e=`# Mutual Non-Disclosure Agreement

> **Template: not legal advice; requires counsel review before use.** See [README](README.md). This is a pre-drafted template for early-stage evaluation conversations. Fill in the \`{{…}}\` placeholders before signing; have your own counsel review the final form.

This Mutual Non-Disclosure Agreement (this **"Agreement"**) is entered into as of \`{{EffectiveDate}}\` (the **"Effective Date"**) between Truehound (\`[LEGAL_ENTITY: e.g. Truehound LLC, a [State] limited liability company]\`) ("**Truehound**"), and \`{{CustomerName}}\`, a \`{{CustomerJurisdiction}}\` \`{{CustomerEntityType}}\` ("**Counterparty**"). Truehound and Counterparty are each a "**Party**" and together the "**Parties**".

This Agreement governs information exchanged while the Parties evaluate a potential business relationship (the **"Purpose"**). It is a standalone agreement; it does **not** create any obligation to enter into a transaction, and it is superseded by the [MSA](MSA.md) and [DPA](DPA.md) once those are executed.

## 1. Definitions

1.1 **Confidential Information.** "**Confidential Information**" means non-public information disclosed by one Party (the **"Discloser"**) to the other (the **"Recipient"**) in connection with the Purpose, whether oral, written, or electronic, that is marked confidential or that a reasonable person would understand to be confidential given its nature or the circumstances of disclosure. It includes, without limitation, product architecture, roadmaps, pricing, security designs, source code, business plans, customer lists, and the existence and contents of the Parties' discussions.

1.2 **Carve-outs.** Confidential Information does not include information that the Recipient can demonstrate (a) is or becomes public through no fault of the Recipient, (b) was already known to the Recipient without a duty of confidentiality, (c) is independently developed without reference to the Discloser's Confidential Information, or (d) is rightfully received from a third party without a duty of confidentiality.

## 2. Obligations

2.1 **Use.** The Recipient will use Confidential Information solely for the Purpose.

2.2 **Care.** The Recipient will protect Confidential Information with at least the same degree of care it uses for its own confidential information of like importance, and never less than reasonable care.

2.3 **Disclosure to representatives.** The Recipient may disclose Confidential Information only to its employees, advisors, and contractors who (a) need it for the Purpose and (b) are bound by confidentiality obligations at least as protective as this Agreement. The Recipient is responsible for its representatives' compliance.

2.4 **No reverse engineering.** The Recipient will not reverse-engineer, decompile, or disassemble any tangible item disclosed as Confidential Information except to the extent that restriction is prohibited by applicable law.

## 3. Compelled disclosure

If the Recipient is compelled by law, regulation, or valid legal process to disclose Confidential Information, it may do so provided it (a) gives the Discloser prompt written notice (unless legally prohibited) and (b) discloses only the portion legally required and seeks confidential treatment where available.

## 4. No personal data

The Parties do not intend to exchange Personal Data under this Agreement. If evaluation requires Truehound to process Personal Data on Counterparty's behalf, the Parties will execute the [DPA](DPA.md) first; the data-handling commitments there control, not this Agreement.

## 5. No license; no obligation

5.1 **No license.** Nothing in this Agreement grants any license or right in either Party's intellectual property, except the limited right to use Confidential Information for the Purpose.

5.2 **No commitment.** Neither Party is obligated to proceed with any transaction, to disclose any particular information, or to refrain from independently pursuing similar opportunities.

## 6. Term and return

6.1 **Term.** This Agreement begins on the Effective Date and continues for \`{{Term}}\` (default: **two (2) years**). Confidentiality obligations survive termination for a further **three (3) years**, except that trade secrets remain protected for as long as they qualify as trade secrets under applicable law.

6.2 **Return or destruction.** On the Discloser's written request, the Recipient will promptly return or destroy the Discloser's Confidential Information, except (a) one archival copy retained for legal-compliance purposes and (b) copies in routine system backups, which remain subject to this Agreement until deleted in the ordinary course.

## 7. Remedies

Each Party acknowledges that unauthorized disclosure may cause irreparable harm for which monetary damages are inadequate, and that the Discloser may seek injunctive relief in addition to any other remedy, without the requirement to post a bond.

## 8. General

8.1 **Governing law.** This Agreement is governed by the laws of the state in which Truehound is organized (\`[LEGAL_ENTITY state]\`), without regard to conflict-of-laws rules.

8.2 **No assignment.** Neither Party may assign this Agreement without the other's written consent, except to a successor in connection with a merger or sale of substantially all assets.

8.3 **Entire agreement.** This Agreement is the entire agreement on its subject and supersedes prior discussions about confidentiality. It is amended only in a writing signed by both Parties.

8.4 **Notices.** Notices to Truehound: \`truehoundhq@truehound.io\`. Notices to Counterparty: \`{{CustomerNoticeEmail}}\`.

8.5 **Counterparts.** This Agreement may be signed in counterparts, including electronically, each of which is an original.

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