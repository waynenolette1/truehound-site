var e=`# Truth Scan

A free, read-only check of a GitHub org's catalog truth: who owns each repo,
whether it is declared in a catalog, archived repos that are still declared,
and basic repo hygiene. It never writes anything, anywhere.

\`\`\`bash
npx @truehound/trust-audit scan <github-org>
npx @truehound/trust-audit scan <github-org> --limit 50 --json
GITHUB_TOKEN=... npx @truehound/trust-audit scan <github-org>   # adds private repos
\`\`\`

## What it checks

The same rules as the app's Foundation page (one engine,
\`src/data/live/truthScan.ts\`, generated into the CLI and the connector):

| Finding                                  | Rule                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| No owner                                 | No CODEOWNERS (at \`.github/\`, the root or \`docs/\`) and no \`spec.owner\` in catalog-info.yaml |
| CODEOWNERS has no repo-wide owner        | CODEOWNERS exists but has no \`*\` rule                                                       |
| Owned by one person, not a team          | The resolved owner is a user or an email                                                    |
| Several teams claim it                   | The \`*\` rule names two or more teams                                                        |
| Catalog owner disagrees with CODEOWNERS  | catalog-info.yaml \`spec.owner\` and the CODEOWNERS \`*\` owners name different teams or people |
| No service descriptor / no tier          | No catalog-info.yaml, or no \`truthmap.dev/tier\` annotation or tier topic                    |
| Archived repo still declared             | An archived repo whose catalog-info.yaml still declares a Component that is not deprecated  |
| README, CI, dependency updates, security | README, a CI config, Dependabot or Renovate, SECURITY.md                                    |

Every check is pass, fail or **unknown**. Unknown is never counted as pass.
**On-call is always unknown** unless PagerDuty is connected in the app; the scan
never guesses who gets paged.

## What it reads, and from where

- Without a token, \`api.github.com\` is used only to list the org's repos: at
  most 4 requests of GitHub's 60 per hour anonymous budget. Every file is read
  from \`raw.githubusercontent.com\`.
- The 20 most recently pushed, non-archived repos are read (\`--limit\` changes
  it). The report says how many repos were read and why the rest were not.
- \`raw.githubusercontent.com\` cannot list a folder, so without a token CI is
  unknown when no common workflow file name is found. With a token the scan
  lists \`.github/workflows\` like the app does.
- A token is sent only to GitHub.

## The badge

\`\`\`markdown
[![catalog](https://<connector>/badge/<org>/<repo>.svg)](https://<connector>/verify/<org>/<repo>)
\`\`\`

It reads \`catalog | verified\` when a team owns the repo, catalog-info.yaml
declares it with a tier, it is not archived, and the two owner sources agree;
\`catalog | drift: N\` when N of those fail; \`catalog | unknown\` when the repo is
private, missing, or could not be read. Unknown is never shown as verified.

## Shared reports

The app's Foundation page (and \`POST /scan\` on the connector) can publish a
report at \`/r/<id>\`: a plain page with the findings, the scan date and what was
not checked. Stored for 30 days: the org name and public file facts only.
Single-person owners (handles, emails) are withheld.
`;export{e as default};