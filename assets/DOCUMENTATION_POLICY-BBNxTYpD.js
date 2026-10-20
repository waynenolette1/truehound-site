var e=`# Truehound — documentation policy

> Status: **In force.** Owner: repo maintainers. Review: quarterly.
>
> This is the canonical statement of how Truehound treats documentation.
> If you change behavior, this is the file that tells you where the
> matching doc lives.

## The rule

**GitHub is the source of truth for Truehound engineering documentation.**
READMEs at the repo root, deeper docs under \`docs/\`, in Markdown, in
the repo that owns the code.

Confluence, Google Docs, Jira, and Slack are not authoritative. If
you want a doc reviewed or referenced, it has to be in this repo.

## Why

Truehound's documentation has to be legible to both humans *and* agents
(Claude Code in particular). Agents read the repo; they don't read
Confluence, Google Docs, or Slack threads. In-repo, version-controlled
markdown is what makes AI tooling actually work against this codebase.

Beyond that, in-repo docs:

- Move with the code in the same PR — drift is visible at review time
- Are diffable, searchable, and reviewable like code
- Survive personnel changes — there's no shared drive to lose access to
- Get the same migration story as the code (branching, mirroring, audit)

## The conventions

### 1. Root README

Every repo (Truehound is single-repo today; this rule applies to any
fork or re-skin) has a \`README.md\` at the root that answers:

- **What** the service or project is in one paragraph
- **Who owns it** — link to \`CODEOWNERS\`, plus an on-call rotation if applicable
- **How to run it** — local dev in a single command, with prereqs listed
- **Where to find more** — a link bar to the docs that matter (architecture, security, sales, ops)

### 2. Deeper docs

Everything beyond the README sits under [\`docs/\`](.). Markdown only.
Filename in \`SCREAMING_SNAKE_CASE.md\`. Topical subdirectories like
[\`docs/specs/\`](specs/), [\`docs/legal/\`](legal/),
[\`docs/adr/\`](adr/), [\`docs/runbooks/\`](runbooks/), and
[\`docs/positioning/\`](positioning/) are encouraged when a topic gets
enough files to warrant its own folder.

### 3. Operational docs are in the repo too

Playbooks, runbooks, on-call procedures, dashboard / monitor / alert
links — all live in [\`docs/runbooks/\`](runbooks/). The rule of thumb
from the memo:

> If you would page someone with it, document it in the repo.

Each runbook follows the [runbook template](runbooks/_TEMPLATE.md):
trigger, severity, owner, detection, first-five-minutes, mitigation,
rollback, post-incident.

### 4. Multi-repo initiatives

If a feature or initiative spans more than one repo:

- Pick one repo as the **primary home**. Document the end-to-end
  architecture there.
- Enumerate the related repos with a one-line description of what
  each owns.
- Other repos link back to the primary; they do not duplicate the
  architecture doc.

Truehound is currently single-repo, but the convention applies to any
future split (e.g. if the BFF moves into its own repo, the SPA repo
keeps the user-facing architecture and the BFF repo links back).

### 5. Diagrams are Mermaid

Diagrams use [Mermaid](https://mermaid.js.org/) so they:

- Are version-controlled with the code
- Diff cleanly in PR review
- Render natively in GitHub
- Are readable by agents (Mermaid is plain text)

Avoid Lucid / diagrams.net / Whimsical / Excalidraw exports unless
the source file ships in the repo too. Truehound's existing diagrams are
already Mermaid — see [ARCHITECTURE.md](ARCHITECTURE.md),
[BFF_ARCHITECTURE.md](BFF_ARCHITECTURE.md),
[DEPLOYMENT.md](DEPLOYMENT.md), [SECURITY.md](SECURITY.md),
[OBSERVABILITY.md](OBSERVABILITY.md), [PORTING.md](PORTING.md),
[INTEGRATIONS.md](INTEGRATIONS.md).

### 6. Docs ship in the same PR as the code that changes behavior

The PR template enforces this with a checklist. A behavior-changing
PR without a matching doc update will fail review.

Stale docs are worse than no docs — both for the next engineer and
for Claude. If a doc is unmaintainable, delete it (a deleted doc is
honest; a stale doc is a trap).

### 7. Confluence as entry-point only

Confluence and similar external wikis are fine as **entry points**
that link into GitHub for the authoritative content. They are not
authoritative themselves. If you find yourself copy-pasting Truehound
documentation into Confluence, stop and link instead.

## Stakeholder access

PMs, CDMs, partners, and other non-engineer stakeholders who need
to read these docs should have GitHub read access on the relevant
repos. They've already been onboarded to the baseline GitHub and
Claude Code skills needed to navigate Markdown — access is not the
blocker.

## What goes where — quick map

| You want to write… | It goes in… |
|---|---|
| "What does this service do?" | Root \`README.md\` |
| Architecture diagram | A \`docs/*.md\` with a Mermaid block |
| Design decision rationale | A new file in \`docs/adr/\` |
| Standard spec (audit chain, MCP extension) | \`docs/specs/\` |
| "What do I do if X is on fire?" | \`docs/runbooks/\` |
| Sales materials (pitch, playbook, market intel) | \`docs/\` (top-level) or \`docs/positioning/\` |
| Legal templates | \`docs/legal/\` |
| AI assistant rules | \`CLAUDE.md\` |

## What this policy does NOT cover

- **Customer-facing documentation** — that's a marketing/product
  artefact under a separate publishing pipeline; out of scope here.
- **Inline code comments** — the [Truehound CLAUDE.md](../CLAUDE.md) §
  "Doing tasks" covers the comment policy.
- **PR descriptions / commit messages** — separate; covered in
  [CONTRIBUTING.md](CONTRIBUTING.md).

## Enforcement

- The PR template ([\`.github/pull_request_template.md\`](../.github/pull_request_template.md))
  asks the author to confirm doc updates and link the runbook (if
  relevant)
- Reviewers can request changes citing this policy
- The repo maintainers periodically audit \`docs/\` for staleness;
  out-of-date docs are deleted or marked with a \`Status: stale\`
  banner at the top

---

*If you want me to review or reference a technical document, it
needs to be in GitHub.*
`;export{e as default};