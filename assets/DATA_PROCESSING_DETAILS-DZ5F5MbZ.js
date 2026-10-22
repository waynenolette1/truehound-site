var e=`# Data Processing Details (GDPR Art. 28(3) Annex)

> **Template, not legal advice.** It expands the [DPA](DPA.md) Annex I into the detail an Art. 28(3) processing record and a Customer's Art. 30 register need, and describes Truehound as the code works on 2026-10-22. On any conflict, the DPA and the SCCs govern. The customer-facing summary is the [Privacy Policy](https://truehound.io/#/privacy).

## 1. Roles

| Party                        | Role                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Customer                     | Controller                                           |
| Truehound (\`[LEGAL_ENTITY]\`) | Processor                                            |
| Sub-processors               | As in [\`SUBPROCESSOR_LIST.md\`](SUBPROCESSOR_LIST.md) |

## 2. Where data lives, by build

| Build switch                                           | Where Customer's Personal Data is held                                                                                                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No accounts (\`VITE_API_URL\` unset; truehound.io today) | In Customer's browsers only. Truehound's connector relays some requests (GitHub search, apps that block browsers) per request and stores neither the token nor the response. |
| Accounts on                                            | The workspace in Cloudflare D1, per workspace, plus the browsers                                                                                                             |
| More apps on (\`VITE_SOURCES\`)                          | Scans of each connected app, mailbox metadata discovery and extension sign-ins, in the browser or the workspace                                                              |
| AI on (connector \`ANTHROPIC_API_KEY\`)                  | One request's facts sent to Anthropic, not stored by the connector                                                                                                           |

## 3. Subject-matter, nature and purpose

**Subject-matter.** The Access Audit and related services: finding and removing access that should not exist, access requests, joiners and leavers, and access reviews.

**Nature.** Reading connected apps (read-only first), relaying requests, storing workspace data (with an account), running changes a person confirms, sealing evidence in the Proof log, sending notifications an admin turns on, and, only if switched on and agreed, sending one request's facts to an AI model.

**Purpose.** Providing the Services to Customer, on Customer's documented instructions.

## 4. Categories of data subjects and Personal Data

| Data subjects                            | Personal Data                                                                                                                                              | Source                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Customer's users                         | Email, name, role, sessions (hashed), actions in the Proof log                                                                                             | Customer                                             |
| People in Customer's GitHub organization | Login, name and public email GitHub shares, role, 2FA status, repo access, team and CODEOWNERS entries, commit author handles, deploy key titles and dates | GitHub                                               |
| People in other connected apps           | Name, email, username, role or admin status, status, second factor, last sign-in or activity, groups and app grants                                        | The app                                              |
| Employees in HR feeds                    | Work email, name, manager, department, title, start and leaving dates                                                                                      | HR system or identity provider                       |
| People using the browser extension       | Registered domain and time of an app sign-in, sign-in method, work email if set                                                                            | Extension                                            |
| Mailbox owners (opt-in)                  | Sender domain, subject (140 characters) and date of sign-up and invoice emails                                                                             | Gmail (\`gmail.metadata\`), Outlook (\`Mail.ReadBasic\`) |
| Cardholders (opt-in discovery)           | Software charges: vendor, amount, date, statement line                                                                                                     | Brex, Ramp, Mercury                                  |
| Reviewers and requesters                 | Decisions, reasons, approvals                                                                                                                              | Customer's people                                    |

**Never read:** message, document, file or email body contents; pay, tax, bank or health fields; secret values (masked, never kept).

**Special-category data (GDPR Art. 9).** Not intended. Customer must not upload it.

## 5. Retention

| Data                                                         | Retention                                                   |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| Relayed requests                                             | Not stored                                                  |
| Scan history                                                 | 90 days; the latest scan is kept while the workspace exists |
| Extension sign-ins                                           | 395 days (13 months)                                        |
| Sign-in link records, sessions, invites                      | 24 hours; 30 days from last visit; 7 days                   |
| Alerts sent                                                  | 90 days                                                     |
| Review links for outside reviewers                           | 120 days                                                    |
| Workspace, Proof log, approvals, requests, saved credentials | Until Customer deletes them or the workspace                |
| Restore copies                                               | Up to 30 days after deletion                                |
| Data in Customer's browsers                                  | Until Customer removes it                                   |

Retention runs every 15 minutes in \`connector/api/jobs.mjs\`.

## 6. Deletion and return

Customer deletes a workspace in the product (every row cascades), or asks \`truehoundhq@truehound.io\`; Truehound returns data as JSON or CSV if asked and deletes within 30 days ([DPA](DPA.md) section 8).

## 7. Data-subject rights handling

| Right                                | How Truehound assists                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Access, portability (Art. 15, 20)    | In-product exports; on request, JSON or CSV within 30 days                     |
| Rectification (Art. 16)              | Customer edits in the product, or Truehound corrects on instruction            |
| Erasure (Art. 17)                    | Customer removes entries or the workspace, or Truehound deletes on instruction |
| Restriction, objection (Art. 18, 21) | Truehound acts on Customer's documented instruction                            |

Requests Truehound receives directly are forwarded to Customer within 5 business days.

## 8. International transfers and measures

See the [DPA](DPA.md) section 10 and Annexes II to IV, and [\`SECURITY_ADDENDUM.md\`](SECURITY_ADDENDUM.md).
`;export{e as default};