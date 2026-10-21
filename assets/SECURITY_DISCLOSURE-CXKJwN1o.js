var e=`# Truehound: Coordinated Vulnerability Disclosure Policy

**Version:** 1.0
**Last reviewed:** 2026-05-10
**Status:** In force.

---

## 1. Promise to researchers

Truehound treats security research as a first-class contribution. If you find
a vulnerability in any Truehound product or service and report it to us in
good faith under this policy, **you will not be sued, threatened, or
reported to law enforcement.** That is the only thing that matters in a
disclosure policy, and we have chosen to lead with it.

This policy was modelled on the
[disclose.io safe-harbor template](https://github.com/disclose/diodb), the
[CERT/CC Guide to Coordinated Vulnerability Disclosure](https://vuls.cert.org/confluence/display/CVD/),
and [IETF RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html) for
contact discovery.

---

## 2. Scope

### In scope

The systems that run the hosted Truehound product:

- \`truehound.io\`: the website and the app (served by GitHub Pages)
- Truehound's connector (a Cloudflare Worker): payment confirmation, the
  GitHub code search relay, demo leads, and the other routes it serves
- Truehound's published npm packages (the Truth Scan CLI)

### Out of scope

We will accept and triage these, but **we will not pay bounty for
them and they do not constitute a finding**:

- Findings derived from physical access, social engineering, or
  pretexting our staff
- Denial-of-service or load tests against production
- Issues in third-party services we depend on (report to that vendor)
- Self-XSS, reflected XSS that requires the victim to perform a
  highly unrealistic action, or rate-limiting bypass on UI-only
  surfaces
- Missing security headers without a demonstrated impact
- Username enumeration on the login page (intentional for usability)
- Missing CSRF on logout, missing HttpOnly on a cookie that holds no
  session material, version disclosure
- Findings against your own tenant that would not affect another
  tenant (we want to know if you can affect *someone else's* tenant)

---

## 3. Safe-harbor commitments

If your activity is consistent with this policy, Truehound will:

1. Consider it **authorized access** within the meaning of the
   Computer Fraud and Abuse Act (18 U.S.C. § 1030) and similar laws
   in the EU, UK, Australia, and Canada.
2. **Not pursue civil or criminal action** for accidental, good-faith
   violations of this policy.
3. **Not contact your employer or report you to law enforcement**
   based on the act of reporting.
4. Make a reasonable effort to resolve the issue promptly.
5. Credit your contribution by name (with your consent) when we publish
   the fix.

Truehound is committed to compliance with the U.S. Department of Justice's
2022 [revised CFAA policy](https://www.justice.gov/opa/pr/department-justice-announces-new-policy-charging-cases-under-computer-fraud-and-abuse-act),
which explicitly carves out good-faith security research.

---

## 4. What we ask in return

To stay within the safe harbour:

1. **Report privately first.** Do not publish, share with third parties,
   or post to social media until we have published a fix or 90 days
   have elapsed, whichever is sooner.
2. **Do not access more data than necessary** to demonstrate the bug.
   One record is proof; ten thousand is exfiltration.
3. **Do not modify or delete data** belonging to other tenants. If
   you accidentally write to a record you shouldn't, tell us in the
   report.
4. **Do not run automated scanners against production for more than
   ~5 minutes**, and do not use brute-force credential testing against
   tenant accounts you do not own.
5. **Use a clearly-attributable header** so we can recognise your
   traffic and not waste an hour calling it an attack: please send
   \`X-Truehound-Researcher: <your-handle-or-email>\` on all requests during
   your testing.
6. **Encrypt your report** if it contains exploit details — see § 6.

---

## 5. Response SLAs

| Stage | Commitment |
|---|---|
| Acknowledgement of receipt | 1 business day |
| Initial triage + severity assessment | 5 business days |
| Status updates while remediating | At least every 14 days |
| First fix or mitigation for **Critical** | 14 calendar days |
| First fix or mitigation for **High** | 30 calendar days |
| First fix or mitigation for **Medium** | 90 calendar days |
| First fix or mitigation for **Low** | Best-effort; next quarterly release |
| Public coordinated disclosure | After fix, with researcher credit |

Severity follows [CVSS 4.0](https://www.first.org/cvss/v4.0/specification-document)
with Truehound-specific environmental scoring.

---

## 6. How to report

**Preferred path:** email \`truehoundhq@truehound.io\`.

**For sensitive reports**, say so in a first short email and we will
agree a secure way to send the details. We do not publish a PGP key.
Please do not report through social media.

### What to include

- A clear description of the vulnerability
- The affected URL, endpoint, or component
- Reproduction steps that a reasonably-skilled engineer can follow
- A proof-of-concept (script, screenshot, or minimal exploit)
- Your assessment of the impact and exploitation difficulty
- Your name or handle (optional; required only if you want public credit)

---

## 7. Recognition + bounty

### Acknowledgement

Researchers who report a validated issue may, with their consent, be
credited by name when we publish the fix.

### Monetary bounty

Truehound does not run a paid bug bounty today. What we promise is that
your report gets fixed, on time, with you informed throughout.

---

## 8. Coordinated disclosure timeline

We follow a **90-day responsible-disclosure window** measured from the
date we acknowledge receipt:

- Day 0: Report received, acknowledgement sent.
- Day 5: Severity assigned, initial response with triage.
- Day 14–30: Fix developed and tested.
- Day 30–90: Fix rolled out to all affected tenants; CVE requested if
  applicable.
- Day 90: Public disclosure — coordinated joint statement, with credit.

If we need more than 90 days for a fundamental architectural reason,
we will ask the reporter for an extension and explain why. We will
never ghost a researcher who has reported in good faith.

If the issue is being actively exploited in the wild, we will accelerate
the public-disclosure timeline to minimise the window of harm.

---

## 9. What this policy is not

- **This is not a contract.** It is a public statement of intent.
  Nothing in it creates any binding legal commitment between Truehound
  and a third party — but the safe-harbour commitments in § 3 are
  enforceable as an estoppel against Truehound if relied upon in good
  faith.
- **This is not an authorization to access customer data.** Even
  inside the safe harbour, the rules in § 4 limit what data you may
  access. Going beyond those limits may expose you to liability
  outside this policy.

---

## 10. Related documents

- [SECURITY.md](SECURITY.md) — overall security architecture
- [COMPLIANCE.md](COMPLIANCE.md) — SOC 2 / ISO / HIPAA / GDPR / DORA
- [specs/AUDIT_CHAIN.md](specs/AUDIT_CHAIN.md) — the tamper-evident audit log
- [legal/DPA.md](legal/DPA.md) — Article 28 data-processing agreement

---

## 11. Changes to this policy

We will not silently weaken the safe-harbour commitments in § 3.
Material changes will be announced 30 days in advance on this page.
The full history of this document lives in git.

---

*Truehound — published under CC-BY-4.0. Copy it, adapt it, ship it for your
own service. The world is better with more disclosure policies in it.*
`;export{e as default};