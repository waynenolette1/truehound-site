var e=`# Master Services Agreement

> **Template — not legal advice.** See [README](README.md). Bracketed placeholders are filled in at signing.

This Master Services Agreement (this **"Agreement"**) is entered into as of \`[Effective Date]\` (the **"Effective Date"**) between Truehound, Inc., a Delaware corporation ("**Truehound**"), and \`[Customer Name]\`, a \`[Customer Jurisdiction]\` \`[Customer Entity Type]\` ("**Customer**"). Truehound and Customer are each a "**Party**" and together the "**Parties**".

## 1. Services

1.1 **Services.** Truehound will provide the engineering operations control plane services described at <https://atlas.example> and the order form attached as **Order Form 1** (the "**Services**").

1.2 **Order forms.** Each order form will reference this Agreement and specify (a) the subscription tier, (b) the seat count or commit, (c) the term, (d) the contract value, and (e) any tenant-specific terms.

1.3 **Subscription tier.** Customer's tier (Free, Team, Business, Enterprise) is recorded on the order form. Tier caps are documented at <https://atlas.example/welcome#pricing> and may be updated by Truehound with 60 days' written notice provided no published-tier downgrade exceeds 10% of seat-equivalent capacity per year.

## 2. Truehound obligations

2.1 **Performance.** Truehound will perform the Services in accordance with the SLA at [\`SLA.md\`](SLA.md) (the "**SLA**") and applicable law.

2.2 **Audit chain.** Truehound maintains a tamper-evident SHA-256 hash chain of every state-changing action per the [Truehound Audit Chain Specification v0.1](../specs/AUDIT_CHAIN.md), mirrored to S3 Object Lock for tamper evidence and independently verifiable offline. Customer may export its tenant data, including the chain, via the BFF endpoint \`GET /api/v1/admin/tenant/export\` at any time, including post-termination per § 9.4. The security controls are detailed in [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md).

2.3 **Two-key approval.** State-changing actions affecting Customer's upstream systems require two authenticated approvers per the [risk classification](../specs/AUDIT_CHAIN.md#3-event-format). Truehound does not auto-approve actions regardless of risk class.

2.4 **Data residency.** Customer's data is stored in the region specified on the order form (us-east-1 by default, eu-west-1 for EU tenants, ap-southeast-1 for APAC). Data does not cross regions without written authorisation.

2.5 **Sub-processors.** Truehound's sub-processor list is published at <https://atlas.example/trust> and in [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md). Truehound will provide 30 days' written notice before adding a new sub-processor; Customer may terminate this Agreement without penalty if Customer reasonably objects.

## 3. Customer obligations

3.1 **Authorised users.** Customer is responsible for the activities of its authorised users. Customer will not (a) reverse-engineer the Services, (b) use the Services to provide a competing service, (c) circumvent the published tier caps.

3.2 **Customer data.** Customer is responsible for the accuracy and lawfulness of customer data submitted through integrations.

3.3 **Acceptable use.** Customer's use of the Services is subject to the Acceptable Use Policy at [\`ACCEPTABLE_USE.md\`](ACCEPTABLE_USE.md), which is incorporated by reference. Customer will not use the Services to violate applicable law or to send unsolicited communications.

## 4. Fees and payment

4.1 **Fees.** Customer will pay the fees specified in the order form. Truehound invoices annually in advance unless the order form states otherwise.

4.2 **Taxes.** Fees are exclusive of taxes. Customer is responsible for sales / VAT / withholding taxes other than taxes on Truehound's income.

4.3 **Late payment.** Undisputed invoices are due net 30. Late payments accrue interest at 1.5% per month or the maximum rate permitted by law.

4.4 **Marketplace.** When Customer purchases via AWS / Azure / GCP / Atlassian Marketplace, billing flows through that marketplace and § 4.1 is read accordingly.

## 5. Intellectual property

5.1 **Truehound IP.** Truehound retains all rights to the Services, including the underlying software, data models, and audit-chain specification.

5.2 **Customer data.** Customer retains all rights to its data. Customer grants Truehound a non-exclusive, worldwide licence to host and process customer data solely to provide the Services.

5.3 **Aggregated data.** Truehound may use de-identified, aggregated data to improve the Services, provided no Customer is identifiable in the output.

5.4 **Open source.** Truehound's published specifications (audit-chain spec, MCP truth-layer extension RFC) are licensed under Creative Commons Attribution 4.0. Reference implementations are licensed under Apache 2.0.

## 6. ICT third-party risk (DORA Art. 28)

6.1 **Risk register.** When Customer is a financial entity subject to DORA, Truehound will provide the documented information required for Customer's ICT third-party risk register, including (a) location of data processing, (b) nature of data processed, (c) sub-processor list, (d) security controls.

6.2 **Audit cooperation.** Truehound will cooperate with Customer's external auditor or competent authority on reasonable notice and during normal business hours.

6.3 **Termination triggers.** Customer may terminate this Agreement on the conditions specified in DORA Art. 28(7), including material change to Truehound's risk profile, failure to comply with applicable EU law, or insolvency events.

## 7. Confidentiality

7.1 **Definition.** "**Confidential Information**" means non-public information disclosed by one Party to the other in connection with this Agreement, marked or reasonably understood as confidential.

7.2 **Obligations.** Each Party will protect the other's Confidential Information with the same care it uses for its own confidential information, and at least with reasonable care.

7.3 **Carve-outs.** Confidential Information does not include information that (a) is or becomes public through no fault of the receiving Party, (b) was already known to the receiving Party, (c) is independently developed without reference to the disclosing Party's information.

## 8. Warranties and disclaimers

8.1 **Mutual warranties.** Each Party warrants it has authority to enter this Agreement and will comply with applicable laws.

8.2 **Service warranty.** Truehound warrants that the Services will perform substantially in accordance with the documentation. Customer's exclusive remedy for breach of this warranty is the SLA credits described in § 5 of [\`SLA.md\`](SLA.md).

8.3 **Disclaimer.** EXCEPT AS EXPRESSLY PROVIDED, THE SERVICES ARE PROVIDED "AS IS" AND ATLAS DISCLAIMS ALL OTHER WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

## 9. Term and termination

9.1 **Term.** This Agreement begins on the Effective Date and continues until all order forms expire or are terminated.

9.2 **Termination for cause.** Either Party may terminate for material breach upon 30 days' written notice if the breach is uncured.

9.3 **Termination for convenience.** Customer may terminate any order form by giving 90 days' notice prior to the renewal date. Truehound may not terminate for convenience during a paid term.

9.4 **Effect of termination.** Upon termination, (a) Truehound will make Customer's full data export available per [\`DPA.md\`](DPA.md) § 9 within 30 days, (b) Truehound will delete or return Customer's data within 60 days unless retained for legal hold or under WORM retention (DPA § 9.3), (c) accrued fees remain due.

## 10. Indemnification

10.1 **Truehound indemnification.** Truehound will defend Customer against third-party claims that the Services infringe a registered patent or registered copyright, and will pay damages awarded.

10.2 **Customer indemnification.** Customer will defend Truehound against third-party claims arising from Customer's data, Customer's misuse of the Services, or Customer's violation of applicable law, and will pay damages awarded.

10.3 **Procedure.** The indemnified Party will (a) promptly notify the indemnifying Party, (b) give sole control of the defence, (c) cooperate at the indemnifying Party's expense.

## 11. Limitation of liability

11.1 **Cap.** EXCEPT FOR LIABILITY ARISING UNDER § 7 (CONFIDENTIALITY), § 10 (INDEMNIFICATION), OR FROM A PARTY'S WILFUL MISCONDUCT OR FRAUD, EACH PARTY'S AGGREGATE LIABILITY IS CAPPED AT THE FEES PAID BY CUSTOMER UNDER THIS AGREEMENT IN THE 12 MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY.

11.2 **Excluded damages.** NEITHER PARTY IS LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS OR REVENUE.

## 12. Insurance

Truehound maintains (a) cyber liability with limits of US$5M per occurrence / US$10M aggregate, (b) errors-and-omissions with the same limits, (c) general liability and workers' compensation as required by law. Truehound will provide a certificate of insurance on request.

## 13. General

13.1 **Governing law.** This Agreement is governed by the laws of \`[Governing Jurisdiction — Delaware default; UK / Ireland for EU tenants by request]\`, without regard to conflict-of-laws rules.

13.2 **Disputes.** The Parties will attempt to resolve disputes by good-faith negotiation for 30 days before either Party initiates formal proceedings. Each Party submits to the exclusive jurisdiction of the courts of \`[Governing Jurisdiction]\` for matters not resolved.

13.3 **Notices.** Notices to Truehound: truehoundhq@truehound.io. Notices to Customer: the email on the order form.

13.4 **Assignment.** Neither Party may assign without consent, except to a successor in connection with a merger or sale of substantially all assets.

13.5 **Entire agreement.** This Agreement, the order forms, the DPA, the SLA, and any incorporated specifications constitute the entire agreement on this subject and supersede prior agreements.

13.6 **Survival.** §§ 5 (IP), 7 (Confidentiality), 8.3 (Disclaimer), 9.4 (Effect of termination), 10 (Indemnification), 11 (Liability cap), and 13 (General) survive termination.

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