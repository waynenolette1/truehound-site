var e=`# Security Addendum

> **Template: not legal advice and not a security attestation.** It describes
> how the hosted Truehound app actually handles data today. A buyer should have
> its own counsel and security team review it against the live product before
> relying on it.

This Security Addendum (this **"Addendum"**) supplements the [MSA](MSA.md)
and, where Truehound processes Personal Data, the [DPA](DPA.md). This Addendum
must not assert a control Truehound has not shipped. If it ever diverges from
the live product, that is a documentation bug to fix, not a term to enforce.

## 1. Scope and architecture

This Addendum applies to the hosted Truehound app at https://truehound.io.
Any other deployment shape (for example a self-hosted installation) applies
only if an order form says so, and then the order form sets the security terms.

The hosted app is a static web application served by GitHub Pages. It runs in
Customer's browser:

- **Git-host tokens** (GitHub, GitLab, Bitbucket) are stored in the browser's
  local storage and sent only to those hosts. Calls go straight from the
  browser to them.
- **PagerDuty and Datadog keys** are held in browser memory during a pull and
  are never persisted. Because those vendors block direct browser calls, each
  request goes through Truehound's connector, a Cloudflare Worker, which
  forwards the key with that one request and stores neither the key nor the
  response.
- **Customer's workspace** (services, owners, on-call, findings, the
  Autopilot policy, imports) is stored in the browser's local storage.
  Truehound has **no server-side database of Customer catalog data**.

What does reach Truehound is listed in the
[Privacy Policy](https://truehound.io/#/privacy) and the
[Sub-processor List](SUBPROCESSOR_LIST.md): payment confirmation from Stripe
(session, plan and email), live-demo form leads (name, email, campaign tags,
page, timestamp) in Cloudflare Workers KV, Truth Scan reports of public GitHub
organisations kept for 30 days, and email Customer sends us. Product analytics
(PostHog) and AI drafts (Anthropic) are used only when enabled.

## 2. Certifications

**Truehound holds no third-party security certification or attestation.**
Truehound is not SOC 2 attested and not ISO 27001 certified. No such report is
represented to exist. If one becomes available, Truehound will say so on its
website.

## 3. Controls (as shipped)

| Control | What it is today |
|---|---|
| Encryption in transit | Every connection (to the app, the connector, Stripe and the vendors) uses HTTPS. |
| Data minimisation | Tokens and catalog data stay in Customer's browser; the connector stores no keys and no vendor data. |
| Secrets on the connector | Truehound's own secrets (the Stripe key, the activation secret, the AI key when AI is enabled) are Cloudflare Worker secrets. They are never returned to the browser and never logged. |
| Changes to Customer's repositories | Pull requests only. Truehound never pushes to a default branch and never merges; Customer reviews and merges. Autopilot is off by default and, when an admin switches it on (paid plans only), only opens a pull request adding a \`catalog-info.yaml\` from CODEOWNERS, after a veto window Customer sets, with a rollback. Everything else is a draft a person approves. |
| Least privilege | Customer chooses each token's scope. A read-only token is enough to see findings; opening pull requests needs \`contents\` and \`pull requests\` write on the repositories Customer chooses. |
| Relay safety | The Slack digest relay accepts only Slack incoming-webhook URLs and stores nothing. The lead route stores no IP address and no user agent; client IPs are used in memory only for rate limiting. |
| Payment | Card details are entered on Stripe's own checkout page and never reach Truehound. |
| AI (only if enabled) | The browser sends the connector only the repository facts needed for the request; no token is sent. Output is labelled as AI drafted and validated against its input before it is returned. |
| No third-party scripts by default | Fonts are self-hosted. With analytics off (the default), the app makes no third-party analytics requests. |

## 4. Customer's part

Because tokens and the workspace live in Customer's browser, Customer is
responsible for securing the devices and browser profiles used with
Truehound, choosing token scopes, and revoking tokens with the issuing
provider when they are no longer needed. Signing out removes tokens from the
browser.

## 5. Vulnerability disclosure and incident response

5.1 Truehound runs a coordinated vulnerability disclosure policy. See
[\`../SECURITY_DISCLOSURE.md\`](../SECURITY_DISCLOSURE.md). Report to
\`truehoundhq@truehound.io\`.

5.2 **Personal-Data Breach.** Where Truehound processes Personal Data,
Truehound notifies Customer without undue delay after becoming aware of a
breach affecting it, per the [DPA](DPA.md).

## 6. Sub-processors

Truehound's sub-processors are listed in
[\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md), with 30 days' notice before a
new one that processes Personal Data is added.

## 7. Questions and evidence

Security questionnaires and evidence requests go to \`truehoundhq@truehound.io\`.
Truehound answers them from this Addendum, the
[Privacy Policy](https://truehound.io/#/privacy) and the open-source parts of
the product.

## 8. Changes

Truehound may update this Addendum as controls change. Changes that materially
reduce Customer's protection take effect on Customer's next renewal, unless
required earlier by law.

---

**Related**

- [Privacy Policy](https://truehound.io/#/privacy): what reaches us
- [\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md): what crosses each boundary
- [\`DPA.md\`](DPA.md): data-processing agreement
- [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md): sub-processors
`;export{e as default};