var e=`# Order Form

> **Template, not legal advice.** The commercial order form under the [MSA](MSA.md), for customers who buy by invoice or purchase order instead of a Stripe Payment Link, or who want a countersigned record of what they bought. Fill in the \`{{…}}\` placeholders before signing. The one founder placeholder is \`[LEGAL_ENTITY]\`, the same value as \`LEGAL_ENTITY\` in \`src/brand.ts\`.

This Order Form (this **"Order Form"**) is entered into as of \`{{EffectiveDate}}\` (the **"Effective Date"**) between \`[LEGAL_ENTITY: Truehound LLC, a [State] limited liability company]\` (**"Truehound"**) and \`{{CustomerName}}\` (**"Customer"**). It is governed by the Master Services Agreement between the Parties dated \`{{MSADate}}\` (the **"MSA"**). Capitalised terms not defined here have the meaning given in the [MSA](MSA.md). Where this Order Form and the MSA conflict on a commercial term stated here, **this Order Form controls**.

This is **Order Form \`{{OrderFormNumber}}\`** under [MSA](MSA.md) Section 1.2.

## 1. Plan

Tick one. Prices are by services covered, never per seat; everyone at Customer can use Truehound.

| Plan | Services covered | Price |
|---|---|---|
| ☐ Starter | Up to 50 | $50 a month, or $500 a year |
| ☐ Catalog kept true, S | Up to 150 | $500 a month, or $5,000 a year |
| ☐ Catalog kept true, M | Up to 450 | $1,500 a month, or $15,000 a year |
| ☐ Catalog kept true, L | Up to 1,500 | $4,500 a month, or $45,000 a year |
| ☐ Catalog kept true, above 1,500 | \`{{ServiceCount}}\` | $3 per service per month |
| ☐ Compass migration, done for you, S / M / L | Up to 150 / 450 / 1,500 | $6,000 / $12,500 / $29,000, one time |

| Item | Value |
|---|---|
| Plan selected | \`{{Plan}}\` |
| Billing period | \`{{BillingPeriod}}\` (monthly or annual) |
| Discount, if any | \`{{Discount}}\` (for example a founding-customer discount, stated here with its lock period) |

## 2. Term and renewal

| Item | Value |
|---|---|
| Start date | \`{{StartDate}}\` |
| First period ends | \`{{EndDate}}\` |
| Renewal | Renews automatically for periods of the same length until cancelled ([MSA](MSA.md) Section 4.2). Customer may cancel at any time by email; cancellation takes effect at the end of the paid period. |

## 3. Fees and payment

| Item | Value |
|---|---|
| Fee for the first period | \`{{Fee}}\` |
| Payment | In advance, by \`{{PaymentMethod}}\` (Stripe, ACH or wire) |
| Invoice terms | \`{{PaymentTerms}}\` (default: due within 30 days of invoice) |
| Purchase order | \`{{PONumber}}\` (if required) |

3.1 Fees exclude taxes ([MSA](MSA.md) Section 4.4).

3.2 **Compass migration.** A 50% deposit of \`{{Deposit}}\` is due on signing and books the work. The balance is due when Customer accepts the dry run. The deposit is refundable until Customer accepts the dry run. If your Compass migration is not done before your renewal date, the migration fee is refunded. Customer's Compass renewal date: \`{{CompassRenewalDate}}\`.

## 4. Scope (Compass migration only)

\`{{MigrationScope}}\`: the Compass components to migrate, the target repositories, and the dry-run acceptance criteria.

## 5. Service levels and data

5.1 **Availability and support.** The [SLA](SLA.md) applies: best-effort availability, no uptime percentage and no credits, unless an enterprise uptime commitment is written here: \`{{EnterpriseUptimeTerms}}\` (default: none).

5.2 **Data processing.** Where Truehound processes Customer Personal Data, the [DPA](DPA.md) applies.

5.3 **Customer-specific terms.** \`{{CustomerSpecificTerms}}\` (default: none).

## 6. Contacts

| Role | Truehound | Customer |
|---|---|---|
| Billing, legal notices and support | \`truehoundhq@truehound.io\` | \`{{CustomerContactEmail}}\` |

---

By signing, each Party agrees to this Order Form and the [MSA](MSA.md).

**Signatures**

\`[LEGAL_ENTITY]\`
By: ______________________________
Name: \`{{TruehoundSignatory}}\`
Title: \`{{TruehoundSignatoryTitle}}\`
Date: ___________________________

\`{{CustomerName}}\`
By: ______________________________
Name: \`{{CustomerSignatory}}\`
Title: \`{{CustomerSignatoryTitle}}\`
Date: ___________________________
`;export{e as default};