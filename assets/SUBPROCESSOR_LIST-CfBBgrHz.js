var e=`# Sub-processor List

> **Template — not legal advice.** This is a starting point, not a finished
> contract. The entries below are **illustrative placeholders** for the
> sub-processors a *hosted* Truehound deployment would typically engage. Truehound's
> binding, current list is published on the trust portal at
> <https://atlas.example/trust>; that portal is the source of truth, and this
> document mirrors it at contract time. A buyer must have its own counsel
> review this before relying on it. Bracketed \`[…]\` placeholders are completed
> at signing.

## How to read this list

- **Truehound-managed (hosted)** customers: Truehound engages the sub-processors below
  to deliver the Services. The list reflects the Customer's selected data
  region (recorded on the order form per [MSA](MSA.md) § 2.4).
- **Self-hosted** customers: Truehound engages **no sub-processors** for your
  deployment — you run the BFF, database, and object store inside your own
  infrastructure, and your own providers are not Truehound sub-processors. The
  only flows leaving your network are the vendor API reads *you* configure
  ([\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md)).

## Notification commitment

Per [MSA](MSA.md) § 2.5 and [DPA](DPA.md) § 6.1, Truehound will give **30 days'
written notice** before adding or replacing a sub-processor that processes
Personal Data. Customers may subscribe to the trust portal to receive these
notices. A Customer that reasonably objects within the notice period may, where
Truehound cannot offer a commercially reasonable alternative, terminate the
affected Services without penalty.

## Current sub-processors (illustrative — hosted deployment)

| Sub-processor | Service provided | Personal Data processed | Region(s) | Notes |
|---|---|---|---|---|
| \`[Cloud infrastructure provider]\` | Compute, managed Postgres, object storage (audit archive) | All operational metadata + audit chain | Matches order-form region (e.g. \`us-east-1\`, \`eu-west-1\`, \`ap-southeast-1\`) | Primary infrastructure host; data does not cross regions without written authorisation ([MSA](MSA.md) § 2.4) |
| \`[Transactional email provider]\` | Account, billing, and incident-notification email | Recipient name + email address | \`[Region]\` | Used only for service email; no marketing without consent |
| \`[Error / log telemetry provider]\` | Application error aggregation | Limited operational metadata; secret-named fields redacted before egress ([\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md)) | \`[Region]\` | Optional; can be disabled for a tenant on request |
| \`[Uptime monitoring provider]\` | External uptime measurement for the [SLA](SLA.md) | None (synthetic probes only) | Multi-region | Source of the SLA Monthly Uptime measurement ([SLA](SLA.md) § 2) |
| \`[Payment / billing processor]\` | Subscription billing (direct customers) | Billing contact + payment metadata | \`[Region]\` | Bypassed when Customer purchases via a cloud marketplace ([MSA](MSA.md) § 4.4) |
| \`[Support ticketing provider]\` | Support case management | Names, emails, and content Customer includes in tickets | \`[Region]\` | Enterprise dedicated channels may differ — see order form |

> **No vendor-data sub-processing.** The third-party systems Truehound *reads from*
> on a Customer's behalf (Datadog, PagerDuty, Jira, etc.) are the **Customer's**
> integrations, configured by the Customer with the Customer's own credentials.
> They are not Truehound sub-processors; Truehound neither contracts with them nor
> stores their secrets ([\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md)).

## Onward sub-processing

Each sub-processor is bound by data-protection terms no less protective than
the [DPA](DPA.md), and Truehound remains liable to Customer for its sub-processors'
acts and omissions ([DPA](DPA.md) § 6.2–6.3).

---

**Related**

- [\`DPA.md\`](DPA.md) § 6 — sub-processor terms
- [\`MSA.md\`](MSA.md) § 2.4–2.5 — data residency + sub-processor notice
- [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md) — security controls
- Trust portal — <https://atlas.example/trust> (binding current list)
`;export{e as default};