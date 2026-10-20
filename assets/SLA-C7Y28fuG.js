var e=`# Service Level Agreement

> **Template, not legal advice.** Truehound does not yet measure uptime with an independent monitor, so this document makes no uptime percentage promise and offers no service credits. It states what Truehound does commit to: best-effort availability, support response targets, and honest status communication. A contractual uptime commitment with credits is available only to enterprise customers, and only when it is written into a signed [Order Form](ORDER_FORM.md).

## 1. Definitions

- **"Service"** means the Truehound service catalog product, including the website and app and Truehound's connector.
- **"Severity"** is defined in Section 3.1.

## 2. Availability

2.1 **Best effort.** Truehound uses commercially reasonable efforts to keep the Service available. It does not promise a monthly uptime percentage, and no service credits apply.

2.2 **How the Service is built affects availability.** The app runs in the customer's browser and is served by GitHub Pages. GitHub, GitLab and Bitbucket calls go from the browser directly to those hosts. PagerDuty and Datadog calls, payment confirmation and the Slack digest pass through Truehound's connector on Cloudflare. An outage at any of those providers can affect the Service, and is outside Truehound's control.

2.3 **No effect on customer repositories.** If the Service is unavailable, nothing in the customer's repositories changes. Truehound never pushes to a default branch or merges, so an outage cannot leave a repository half-changed.

2.4 **Enterprise.** An enterprise customer may agree a measured uptime commitment, its measurement method and any credits on a signed Order Form. Nothing in this document creates one.

## 3. Support

### 3.1 Severity definitions

| Severity | Description | Examples |
|---|---|---|
| **P1, Critical** | The Service is unusable for the customer, with no workaround. | The app does not load; a paid workspace stays locked after payment. |
| **P2, High** | A major function is impaired; a workaround exists. | One integration fails to sync; pull requests cannot be opened. |
| **P3, Medium** | A minor function is impaired. | A slow page; a non-critical display bug. |
| **P4, Low** | A question, request or cosmetic issue. | A documentation question; a feature idea. |

### 3.2 Response targets

Support is by email at \`truehoundhq@truehound.io\`. Truehound aims to give a first substantive response within these times (business days are Monday to Friday, US business hours, excluding US public holidays):

| P1 | P2 | P3 | P4 |
|---|---|---|---|
| 1 business day | 2 business days | 3 business days | 5 business days |

These are targets, not guarantees, and no credits apply when one is missed.

## 4. Status communication

4.1 Truehound emails affected paying customers about a P1 incident while it is open and when it is resolved.

4.2 For a P1 incident, Truehound shares a short written summary of what happened and what changed on request.

## 5. Maintenance

5.1 Because the app is a static site and the connector is a Cloudflare Worker, most updates happen without downtime. If planned work could interrupt the Service, Truehound gives notice where it reasonably can.

## 6. Exit

6.1 Customer data lives in the customer's browser and in the customer's own repositories, so it stays with the customer when the subscription ends. Pull requests already opened stay in the customer's repositories under the customer's control. The \`catalog-info.yaml\` files Truehound helped add are ordinary files in those repositories.

## 7. Changes

7.1 Truehound may update this document with 30 days' notice. A change that reduces a customer's rights takes effect at that customer's next renewal.

---

This document is incorporated by reference into the [MSA](MSA.md).
`;export{e as default};