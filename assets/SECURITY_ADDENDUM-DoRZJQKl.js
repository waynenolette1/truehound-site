var e=`# Security Addendum

> **Template — not legal advice.** This is a starting point, not a finished
> contract and not a security attestation. It describes the security controls
> Truehound has *shipped* and is grounded in the engineering docs cited throughout.
> A buyer must have its own counsel and security team review it against the
> live product before relying on it. Jurisdiction-specific and regime-specific
> review is required. Bracketed \`[…]\` placeholders are completed at signing.

This Security Addendum (this **"Addendum"**) supplements the [MSA](MSA.md) and,
where Truehound processes Personal Data, the [DPA](DPA.md). Where this Addendum
conflicts with the technical documentation it references, **the live product
behaviour and the engineering docs govern** — this Addendum must not assert a
control Truehound has not shipped. If the two diverge, that is a documentation bug
to fix, not a term to enforce.

## 1. Scope

This Addendum applies to the Services as defined in the MSA. Truehound is offered
in two operating models, and the responsibility split differs:

- **Truehound-managed (hosted).** Truehound operates the BFF, Postgres, and the S3
  audit archive. The controls below are Truehound's responsibility.
- **Self-hosted (Customer's VPC).** Customer operates the infrastructure;
  Truehound ships the software and the controls are Customer-operated. Truehound's
  obligations are limited to providing software that implements the documented
  controls. See [\`../REFERENCE_ARCHITECTURE.md\`](../REFERENCE_ARCHITECTURE.md)
  for the trust-boundary split.

The order form records which model applies.

## 2. Certifications

**Truehound holds no third-party security certification or attestation.** Truehound is
not SOC 2 attested, not ISO 27001 certified, and is not certified against any
other regime. Truehound's architecture is *compatible with a Customer's audit of*
SOC 2 / ISO 27001 / DORA / NIS2 / NIST 800-53 / EU AI Act Art. 14 — the control
crosswalks are published in [\`../SECURITY.md\`](../SECURITY.md) and
[\`../AUDIT_CHAIN_COMPLIANCE.md\`](../AUDIT_CHAIN_COMPLIANCE.md). The truthful
framing is "compatible with the Customer's audit of X," never "compliant with
X." Where a SOC 2 Type II report becomes available it will be published to the
trust portal; until then, no such report is represented to exist.

## 3. Data-protection controls (as shipped)

These map to GDPR Art. 32 and to [DPA](DPA.md) Annex II. Each is grounded in
[\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md).

| Control | Implementation | Reference |
|---|---|---|
| Encryption in transit | TLS 1.3; HSTS preloaded; no TLS 1.0/1.1 | [\`../SECURITY.md\`](../SECURITY.md) |
| Encryption at rest | AES-256-GCM; KMS-wrapped keys; S3 archive encrypted | [\`../SECURITY.md\`](../SECURITY.md) |
| Tenant isolation | Postgres row-level security pinned by \`set_config('app.tenant_id')\` on every per-tenant query; a query missing the scope returns zero rows | [\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md) |
| Tamper-evident audit | SHA-256 hash-linked log; every state-changing action sealed; mirrored to S3 Object Lock (COMPLIANCE mode); offline, zero-dependency verifier | [\`../specs/AUDIT_CHAIN.md\`](../specs/AUDIT_CHAIN.md) |
| Two-key approval | State-changing actions to upstream systems require two distinct authenticated approvers (proposer ≠ approver); no auto-approval | [\`../TWO_KEY_GATE.md\`](../TWO_KEY_GATE.md), [\`../enterprise/RBAC_MODEL.md\`](../enterprise/RBAC_MODEL.md) |
| Access model | RBAC (admin / operator / viewer); BFF is the trust boundary — bearer token → tenant scope, \`x-admin-token\` → admin scope; SPA guards are UX only | [\`../enterprise/RBAC_MODEL.md\`](../enterprise/RBAC_MODEL.md) |
| Secrets handling | Vendor secrets live in BFF env vars only — never persisted to Postgres, never logged (structured logger redacts secret-named fields), never sent to the SPA | [\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md) |
| Webhook integrity | Outbound and inbound action callbacks signed HMAC-SHA256; secrets returned once, stored hashed/encrypted | [\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md) |
| Supply chain | CycloneDX SBOM emitted per release for SPA / BFF / CLI; dependency scanning | [\`../SECURITY.md\`](../SECURITY.md) §SBOM |

## 4. Controls that are planned, not shipped

In keeping with Truehound's documentation policy, the following are identified as
**planned** so a Customer does not rely on them as delivered:

- **Production SSO (SAML 2.0 / OIDC).** The provider interfaces and Okta /
  Entra / Ping adapters ship, and the SPA demonstrates a full mock-IdP
  round-trip, but the server-side assertion/token validation in the BFF is the
  remaining work. The default sign-in is a username/password gate that is
  explicitly not hardened for production against real Customer data. See
  [\`../enterprise/SSO_SAML_OIDC.md\`](../enterprise/SSO_SAML_OIDC.md).
- **Signed SBOM attestation.** SBOMs are emitted but not signed today
  ([\`../SECURITY.md\`](../SECURITY.md) §SBOM).

## 5. Vulnerability disclosure and incident response

5.1 Truehound operates a coordinated vulnerability disclosure policy with
safe-harbor commitments and published response SLAs — acknowledgement within 1
business day, triage within 5 business days, fix targets keyed to CVSS 4.0
severity. See [\`../SECURITY_DISCLOSURE.md\`](../SECURITY_DISCLOSURE.md).

5.2 **Personal-Data Breach.** Where Truehound processes Personal Data, Truehound
notifies Customer without undue delay and within 48 hours of becoming aware,
per [DPA](DPA.md) § 5.

5.3 A security \`security.txt\` is served per RFC 9116 at
\`/.well-known/security.txt\`.

## 6. Sub-processors

Truehound's sub-processors are listed in [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md)
with the 30-day prior-notice commitment for additions.

## 7. Audit and evidence

7.1 Customer may exercise the audit rights in [DPA](DPA.md) § 7.2.

7.2 The audit chain is exportable and independently verifiable offline; SLA
performance metrics are retrievable via \`GET /api/v1/admin/sla-metrics\` and are
audit-chain-signed ([SLA](SLA.md) § 7.2).

7.3 The trust portal (<https://atlas.example/trust>) publishes available
evidence (audit-chain export, SBOM, CAIQ Lite, and a SOC 2 report if and when
one exists) in lieu of repeated audits where Customer's policy permits.

## 8. Changes

Truehound may update this Addendum to reflect newly shipped controls. Changes that
materially reduce Customer's security rights take effect on Customer's next
renewal, consistent with [SLA](SLA.md) § 9.

---

**Related**

- [\`../SECURITY.md\`](../SECURITY.md) — threat model + control crosswalks
- [\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md) — what crosses each boundary
- [\`../enterprise/RBAC_MODEL.md\`](../enterprise/RBAC_MODEL.md) — access model
- [\`DPA.md\`](DPA.md) — data-processing agreement
- [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md) — sub-processors
`;export{e as default};