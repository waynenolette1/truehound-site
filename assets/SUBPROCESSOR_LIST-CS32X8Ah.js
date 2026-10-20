var e=`# Sub-processor List

> **Template, not legal advice.** The providers below are the ones the hosted Truehound product actually uses, as of 2026-10-20. The customer-facing summary is in the [Privacy Policy](https://truehound.io/#/privacy) ("Who processes it for us"). Referenced by [MSA](MSA.md) Section 2.5 and [DPA](DPA.md) Section 6.

## How to read this list

Truehound runs in the customer's browser. Access tokens and catalog data are stored there, and GitHub, GitLab and Bitbucket calls go straight from the browser to those hosts. So the list is short: it covers only the providers that run Truehound's website and its connector, take payment, or are engaged when the customer switches on an optional feature.

## Notification commitment

Truehound will give **30 days' notice by email** before adding or replacing a sub-processor that processes Customer Personal Data ([MSA](MSA.md) Section 2.5, [DPA](DPA.md) Section 6.1). A customer that reasonably objects within the notice period may, where Truehound cannot offer a reasonable alternative, terminate the affected order form and receive a refund of prepaid fees for the remaining term.

## Current sub-processors

| Sub-processor | What it does for Truehound | Data it can see | Location | When engaged |
|---|---|---|---|---|
| Stripe | Checkout, subscriptions and billing records | Billing contact, email, plan, payment metadata (card details are entered on Stripe's own page and never reach Truehound) | United States and other countries where Stripe operates | When the customer pays |
| Cloudflare | Runs Truehound's connector (a Worker) that forwards PagerDuty and Datadog calls, relays the Slack digest and confirms payment, and stores demo-form leads and public Truth Scan reports in Workers KV | In transit: the vendor key and response for each forwarded request, the Slack webhook address and digest (none of these stored). Stored: demo-form name, email, campaign tags, page and timestamp; Truth Scan reports for public GitHub organisations (30 days) | Cloudflare's global network | When those features are used |
| GitHub (GitHub Pages) | Hosts the website and app files | Standard request data such as IP address, under GitHub's own policies | United States and other countries where GitHub operates | Every visit |
| PostHog | Product analytics | Page views and clicks, with on-screen text masked; no session recordings | United States, or the EU when configured | **Only if enabled** for a deployment (off by default) |
| Anthropic | AI model (Claude) for the two labelled AI features, "Investigate with AI" and "Draft the fix with AI", called through Truehound's connector | For that request only: the repository facts it needs (file contents, commit author handles and counts, a linked PagerDuty team name); never access tokens or keys; not stored by the connector | United States | **Only if AI features are enabled** and the customer uses one |

## AI use, in short

AI is used only by the two labelled features above, only when AI is enabled, and only when a person clicks one. Every result is labelled "Drafted by AI (Claude). Review before applying." Autopilot, the Agent panel, findings and scores are computed by fixed rules and do not call an AI model. Truehound does not use customer data to train AI models; Anthropic processes AI requests as Truehound's sub-processor under its commercial terms with Truehound.

## Not sub-processors

The systems Truehound reads from on a customer's behalf (GitHub, GitLab, Bitbucket, PagerDuty, Datadog, Slack and others) are the **customer's own** accounts, connected with the customer's own credentials under the customer's own agreements with those providers. Truehound does not contract with them for the customer and does not store the customer's credentials for them.

## Onward obligations

Truehound relies on each sub-processor's published data processing terms and remains responsible to the customer for their performance of data protection obligations ([DPA](DPA.md) Sections 6.2 and 6.3).

---

**Related**

- [\`DPA.md\`](DPA.md) Section 6: sub-processor terms
- [\`MSA.md\`](MSA.md) Sections 2.2 to 2.5: where data lives and sub-processor notice
- [Privacy Policy](https://truehound.io/#/privacy)
`;export{e as default};