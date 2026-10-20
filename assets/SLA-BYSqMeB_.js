var e=`# Service Level Agreement

> **Template — not legal advice.** Applies to Customers on Business or Enterprise tier per the [MSA](MSA.md) order form. Free and Team tiers receive commercially reasonable effort with no contractual SLA.

## 1. Definitions

- **"Service"** means the Truehound engineering operations control plane.
- **"Monthly Uptime Percentage"** means total minutes in a calendar month minus Downtime, divided by total minutes, expressed as a percentage.
- **"Downtime"** means any minute during which the Service is unavailable to Customer's authorised users due to a failure of Truehound's infrastructure, excluding Excluded Events.
- **"Excluded Events"** means downtime caused by (a) Customer's misconfiguration, (b) Customer's misuse, (c) third-party services not under Truehound's control (e.g. Customer's IdP), (d) scheduled maintenance announced at least 5 business days in advance, (e) force majeure.
- **"Severity"** is defined in § 3.1.

## 2. Uptime commitment

| Tier | Monthly Uptime Commitment |
|---|---|
| Business | 99.9 % |
| Enterprise | 99.95 % |
| Enterprise + multi-region | 99.99 % |

Monthly Uptime is measured by Truehound's external uptime monitor (third-party), with a per-region weighted average for multi-region deployments.

## 3. Support response time

### 3.1 Severity definitions

| Severity | Description | Examples |
|---|---|---|
| **P1 — Critical** | Production fully unavailable; no workaround. | Truehound BFF returns 5xx for >5 minutes; full data unavailability for one or more tenants. |
| **P2 — High** | Major function impaired; workaround exists. | Inbox cannot be loaded but underlying data accessible via API; one of the integration adapters is failing. |
| **P3 — Medium** | Minor function impaired; impact limited. | Single page slow; non-critical UI bug. |
| **P4 — Low** | Question, request, cosmetic issue. | Documentation request; feature suggestion. |

### 3.2 Response targets

| Tier | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Business | 4 hours | 1 business day | 2 business days | 5 business days |
| Enterprise | 1 hour | 4 hours | 1 business day | 3 business days |
| Enterprise + 24×7 | 30 minutes | 2 hours | 1 business day | 3 business days |

Response time is measured from receipt at \`support@truehound.io\` (or the Enterprise dedicated channel) to first substantive engineering response.

## 4. Status communication

4.1 Truehound publishes incident updates at <https://status.atlas.example> in real time during a P1.

4.2 Truehound posts a public post-incident review for any P1 lasting more than 30 minutes within 5 business days. A more detailed customer-specific post-mortem is available to Enterprise tenants on request.

## 5. Service credits

5.1 If Truehound fails to meet the Monthly Uptime Commitment, Customer is entitled to service credits per the table below, applied as a discount on the next invoice.

| Monthly Uptime | Credit (% of monthly fee) |
|---|---|
| ≥ 99.9 % (Business) / ≥ 99.95 % (Enterprise) / ≥ 99.99 % (multi-region) | 0 % |
| < commitment but ≥ 99.0 % | 10 % |
| < 99.0 % but ≥ 95.0 % | 25 % |
| < 95.0 % | 50 % |

5.2 To claim a credit, Customer must email \`truehoundhq@truehound.io\` within 30 days of the affected month. The credit is the sole and exclusive remedy for SLA breach.

5.3 In any 12-month period, total credits cannot exceed 25 % of fees paid in that period.

## 6. Maintenance

6.1 **Scheduled maintenance.** Truehound may perform scheduled maintenance during the maintenance window of 10:00 PM — 4:00 AM UTC on Sundays. Maintenance is announced at least 5 business days in advance.

6.2 **Emergency maintenance.** Truehound may perform emergency maintenance with the shortest practical notice. Time spent in emergency maintenance counts toward Downtime if the Service is unavailable.

## 7. Rights of audit and inspection (DORA Art. 30)

7.1 For Customers that are EU financial entities subject to DORA, this SLA documents (a) the agreed performance levels, (b) the security measures (Annex II of the [DPA](DPA.md)), (c) the audit cooperation framework (§ 7 of the DPA), as required by DORA Art. 30(3).

7.2 The performance metrics in this SLA can be retrieved monthly via Truehound's \`/api/v1/admin/sla-metrics\` endpoint and are signed via the audit-chain export per the [Truehound Audit Chain Spec](../specs/AUDIT_CHAIN.md).

## 8. Exit provisions

8.1 On termination of the MSA, Customer may export its data within 30 days via the BFF endpoint \`GET /api/v1/admin/tenant/export\` (the \`atlas-tenant-export/v0.1\` snapshot).

8.2 Truehound will provide a transition assistance period of up to 90 days post-termination for Enterprise tenants on request and at Truehound's standard hourly rates.

## 9. Updates to this SLA

9.1 Truehound may update this SLA on 60 days' notice. Material changes that reduce Customer's rights (e.g. a lower uptime commitment) take effect on Customer's next renewal date, not earlier.

---

This SLA is incorporated by reference into the [MSA](MSA.md) for Business and Enterprise tier customers.
`;export{e as default};