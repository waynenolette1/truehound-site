var e=`# Sub-processor List

> **Template, not legal advice.** The providers below are the ones Truehound's code actually engages, checked against the code on 2026-10-22. The live list is the public page <https://truehound.io/#/subprocessors>, rendered from \`src/pages/trust/subprocessors.ts\`; this file must name the same providers (\`src/pages/legal/privacyClaims.test.tsx\` fails if they drift). Referenced by the [MSA](MSA.md) Section 2.5 and the [DPA](DPA.md) Section 5 and Annex III.

## How to read this list

Without an account, Truehound runs in the customer's browser: tokens, the audit and the workspace are stored there, and GitHub, GitLab and Bitbucket calls go straight from the browser. So most providers below are engaged only when a feature is used or switched on, and the "When" column says which.

## Notification commitment

Truehound emails every customer's account owners and billing contact **at least 30 days** before adding or replacing a sub-processor that processes customer personal data, and posts the change on the public page and its Atom feed (\`/trust/subprocessors.xml\`). A customer may object in writing within that period on reasonable data protection grounds; if Truehound cannot offer a reasonable alternative, the customer may terminate the affected service for a refund of prepaid fees for the unused period. In an emergency (a provider failing), Truehound may replace one sooner and tells customers as soon as it can, with the same right to object.

## Current sub-processors

| Sub-processor                 | Entity                        | What it does for Truehound                                                                                                                                                           | Personal data it can see                                                                                   | Location                                    | Transfer safeguard                                                 | When engaged                                              |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| GitHub (GitHub Pages)         | GitHub, Inc.                  | Hosts the truehound.io website and app files                                                                                                                                         | Standard request data in GitHub's logs (IP address, browser type)                                          | United States, global content network       | EU-US Data Privacy Framework participant (UK and Swiss extensions) | Every visit                                               |
| Cloudflare                    | Cloudflare, Inc.              | The connector Worker: payment checks, GitHub search and app relays (tokens never stored), demo-form and report-email leads (Workers KV), Truth Scan reports, account workspaces (D1) | In transit: relayed tokens and API responses. Stored: leads; account, workspace, audit and scan data       | Cloudflare's global network                 | DPF participant; SCCs in Cloudflare's DPA                          | When connector features or accounts are used              |
| Cloudflare Workers AI | Cloudflare, Inc. | The AI model (Meta Llama 3.3 70B, hosted by Cloudflare) behind the website's AI rep, which answers visitors' questions from Truehound's published pages | The question a website visitor types; Truehound keeps it (emails and phone numbers masked) with a keyed IP hash for 30 days | Cloudflare's global network | DPF participant; SCCs in Cloudflare's DPA | When a website visitor asks the AI rep a question |
| Stripe                        | Stripe, Inc. and Stripe, LLC  | Checkout, subscriptions, receipts and billing records                                                                                                                                | Billing contact, email, plan, payment metadata (card details go straight to Stripe)                        | United States and elsewhere                 | DPF participant; SCCs in Stripe's DPA                              | When the customer pays                                    |
| Resend                        | Plus Five Five, Inc. (Resend) | Account email: sign-in links, invites, alerts and digest, approval and task requests, review reminders                                                                               | Recipient email and the message                                                                            | United States                               | DPF participant; SCCs in Resend's DPA                              | Once accounts and account email are switched on           |
| Anthropic                     | Anthropic, PBC                | The AI model (Claude) behind the optional AI features and the agent's access-review drafts                                                                                                                                | The facts for that one request (logins, names, roles, finding titles); never tokens, keys or secret values | United States                               | SCCs in Anthropic's DPA (Anthropic does not list the DPF)          | Only if AI is switched on: when a person uses an AI feature, or, with an account, for the agent's scheduled review drafts, which an admin can turn off |
| PostHog                       | PostHog, Inc.                 | Product analytics                                                                                                                                                                    | Page views and clicks with text masked, IP address, browser type; no recordings, no emails                 | United States, or the EU host if configured | SCCs in PostHog's DPA                                              | Only if enabled for a build; not enabled on truehound.io  |
| Microsoft (Azure Bot Service) | Microsoft Corporation         | Delivers access-review messages to Microsoft Teams                                                                                                                                   | The reviewer's Teams user id and the review message                                                        | United States and elsewhere                 | DPF participant; SCCs in Microsoft's DPA                           | Only if an admin connects Teams for reviews               |
| Finch | Finch (San Francisco, California) | Reads the employee list from an HR or payroll system for joiners and leavers | Employees' work email, name, department, title, manager, status, start and end dates | United States | DPF participant (UK and Swiss extensions) | Only if an admin connects an HR system through Finch |
| Merge | Merge API, Inc. | Reads the employee list from an HR system for joiners and leavers | Same as Finch | United States, or the EU or Asia-Pacific region an admin picks | SCCs in Merge's DPA | Only if switched on and an admin connects an HR system through Merge |
| Kombo | Kombo Technologies GmbH | Reads the employee list from an HR system for joiners and leavers | Same as Finch | European Union (Germany) | In the EU; onward to Truehound under the DPA's SCCs | Only if switched on and an admin connects an HR system through Kombo |

Transfer safeguards were checked on 2026-10-22 against each provider's published privacy policy or DPA. DPA acceptance for GitHub, PostHog, Microsoft, Finch, Merge and Kombo is being confirmed by the founder.

## AI use, in short

AI is used only when AI is switched on: by the labelled features a person clicks (Ask Truehound, Draft with AI, review and matching suggestions, and the older catalog features; some ask for on-screen agreement first), and, with an account, by the agent's scheduled access-review drafts while its autopilot is on (the default; an admin can turn it off). Drafts are suggestions; nothing is removed until a person approves. The scan, findings and score do not use AI. Truehound does not use customer data to train AI models, and Anthropic's Commercial Terms of Service (Section B) bar Anthropic from training models on customer content.

## Not sub-processors

The apps Truehound reads on a customer's behalf (GitHub, Google Workspace, Microsoft Entra ID, Slack, Okta, HR, finance, cloud and work tools) are the **customer's own** accounts, connected with the customer's own credentials under the customer's own agreements with those providers. Google Fonts is not used (fonts are served from Truehound's own site), and no advertising or tracking services are used.

## Onward obligations

Truehound binds each sub-processor by written terms at least as protective as the [DPA](DPA.md) and remains responsible to the customer for their performance ([DPA](DPA.md) Section 5.3).

---

**Related**

- [\`DPA.md\`](DPA.md) Section 5 and Annex III
- [\`MSA.md\`](MSA.md) Section 2.5
- [Privacy Policy](https://truehound.io/#/privacy)
`;export{e as default};