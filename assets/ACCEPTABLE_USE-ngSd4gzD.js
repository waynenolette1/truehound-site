var e=`# Acceptable Use Policy

> **Template — not legal advice.** This is a starting point, not a finished
> contract. A buyer (and Truehound) must have counsel review and tailor it to the
> governing jurisdiction before relying on it. Bracketed \`[…]\` placeholders are
> completed at signing.

This Acceptable Use Policy (this **"AUP"**) is incorporated into the
[MSA](MSA.md) by reference (§ 3.3). It applies to Customer and all of
Customer's authorised users. Capitalised terms not defined here have the
meaning given in the MSA.

## 1. Prohibited uses

Customer will not, and will not permit any authorised user to, use the Services
to:

1.1 **Violate law.** Engage in any activity that violates applicable law or
regulation, or that infringes the rights of any third party.

1.2 **Compromise security.** Probe, scan, or test the vulnerability of any
Truehound system except under the [Coordinated Vulnerability Disclosure Policy](../SECURITY_DISCLOSURE.md);
breach or circumvent authentication, the tenant-isolation boundary, the
two-key approval gate, or any access control; or attempt to access another
tenant's data.

1.3 **Abuse the platform.** Circumvent the published tier caps ([MSA](MSA.md)
§ 1.3); reverse-engineer the Services except to the extent that restriction is
unenforceable by law; or use the Services to build or operate a competing
service ([MSA](MSA.md) § 3.1).

1.4 **Misuse integrations and actions.** Use the action loop or any integration
to take state-changing actions against systems the Customer is not authorised
to control, or to relay, scrape, or exfiltrate data the Customer is not
entitled to.

1.5 **Send abusive traffic.** Transmit malware, spam, or unsolicited
communications; conduct denial-of-service activity; or send automated traffic
that materially degrades the Services for other tenants.

1.6 **Upload prohibited content.** Submit special-category Personal Data
(GDPR Art. 9) or other regulated data classes (e.g. payment-card data, PHI)
into free-text or operational fields without the prior written agreement
required by [DPA](DPA.md) Annex I. Truehound is a control plane over operational
metadata and is not designed to hold these data classes.

1.7 **Misrepresent.** Impersonate any person or entity, or falsify the origin
or actor of any audited action.

## 2. Customer responsibility

2.1 Customer is responsible for its authorised users' activity ([MSA](MSA.md)
§ 3.1) and for the accuracy and lawfulness of data it submits through
integrations ([MSA](MSA.md) § 3.2).

2.2 Customer will secure its bearer and admin tokens and its IdP. Truehound never
sees the Customer-provisioned bearer token
([\`../SECURITY_AND_DATA_FLOW.md\`](../SECURITY_AND_DATA_FLOW.md)); credential
hygiene is the Customer's responsibility.

## 3. Enforcement

3.1 **Investigation.** Truehound may investigate suspected AUP violations. The
tamper-evident audit chain ([\`../specs/AUDIT_CHAIN.md\`](../specs/AUDIT_CHAIN.md))
is the authoritative record of state-changing activity.

3.2 **Response.** For a violation that poses an imminent risk to the Services,
to other tenants, or to a third party, Truehound may suspend the affected access
with the shortest practical notice and will notify Customer promptly. For other
violations, Truehound will give notice and a reasonable opportunity to cure where
practicable. Suspension does not relieve Customer of its payment obligations.

3.3 **Termination.** A material or repeated AUP violation that is not cured is a
material breach under [MSA](MSA.md) § 9.2.

## 4. Reporting abuse

Report suspected abuse of the Services to \`truehoundhq@truehound.io\`. Report security
vulnerabilities under the [Coordinated Vulnerability Disclosure Policy](../SECURITY_DISCLOSURE.md)
to \`security@truehound.io\` — not through general support.

## 5. Changes

Truehound may update this AUP on notice consistent with [MSA](MSA.md) § 1.3.
Changes that materially expand the prohibitions take effect on Customer's next
renewal unless required earlier by law or to address an imminent risk.

---

**Related**

- [\`MSA.md\`](MSA.md) § 3 — Customer obligations
- [\`DPA.md\`](DPA.md) Annex I — prohibited data classes
- [\`../SECURITY_DISCLOSURE.md\`](../SECURITY_DISCLOSURE.md) — vulnerability reporting
`;export{e as default};