var e=`# Audit Log Design

> Production-grade audit logging for Truehound. Closes the single biggest
> code-side gap flagged in [COMPLIANCE.md](COMPLIANCE.md): the in-memory
> \`AuditEvent\` store satisfies the schema but not the controls auditors
> read against SOC 2 CC7.2, ISO 27001 A.8.15, HIPAA 45 CFR 164.312(b), and
> GDPR Articles 5(1)(f) and 30. This document is engineering-facing —
> pair it with [SECURITY.md](SECURITY.md) (architecture) and
> [DEPLOYMENT.md](DEPLOYMENT.md) (runtime).

## Executive summary

1. **Hash-chain wins for SaaS audit.** A per-tenant SHA-256 hash chain
   gives auditor-verifiable tamper-evidence at zero infrastructure cost.
   A blockchain (PoW or PoS) adds latency, cost, and key-management
   surface for no incremental control benefit.
2. **WORM storage is the second leg.** Hash-chain proves "the log was
   not edited"; WORM proves "the log was not truncated." Truehound needs
   both. S3 Object Lock in **compliance mode** is the 2026 default.
3. **Seal cadence: per-event chain plus per-minute Merkle root.** Every
   event extends the chain; every minute Truehound writes the root to a
   second WORM object so the verification window is bounded even if a
   tenant ingests millions of events.
4. **Algorithm: SHA-256 (FIPS 140-3 validated).** BLAKE3 is faster but
   procurement language and FedRAMP boilerplate still names SHA-256.
5. **Anchoring is optional, not required, for SOC 2.** Auditors accept
   the chain plus WORM. HSM-anchoring (KMS-signed roots) only helps
   when Truehound itself is under suspicion, e.g. forensic incidents and
   highest-tier financial-services tenants.
6. **PII handling: pseudonymise at write, not at delete.** Store
   \`actorIdHash = HMAC-SHA-256(actorId, tenantSecret)\` in the audit
   record; keep the \`actorId → hash\` map in a separate erasable store.
   Subject-access (GDPR 15) and erasure (GDPR 17) both work without
   breaking the chain.
7. **Retention defaults: 13 months baseline; 6-year HIPAA preset; 7-year
   SOX preset.** Drive from \`tenantConfig.compliance\`.
8. **Append-only does not mean unsearchable.** Build a log-structured
   index (event id → object key + offset) outside the WORM tier. The
   index is rebuildable from the immutable log so its mutability does
   not weaken integrity.
9. **Verifier is shippable today.** A 200-line CLI that walks the chain
   and recomputes per-minute roots is sufficient for auditor
   self-service. No HSM required for the demo path.
10. **Three concrete code changes** — add \`AuditSink\` to repository ports,
    add the chain fields to \`AuditEvent\`, replace the localStorage write
    in \`actions.ts\` with a sink call. Detailed list at the end of this
    doc.

## Hash-chain vs blockchain — why hash-chain wins for SaaS audit

A blockchain is a hash-chain plus a consensus protocol. For an audit
log there is no untrusted-writer problem to solve — the log writer
*is* the trusted party. Truehound already controls the keypair, the
storage tier, and the signature. Adding consensus pays a 100×–1000×
write-latency tax for a property (Byzantine fault tolerance) that
auditors do not score against any of the relevant controls.

The right primitive is the same one **AWS QLDB** ships under the hood:
an event journal whose every record carries the SHA-256 hash of the
previous record, and a periodic **Merkle tree digest** anchored
externally for spot-verification (AWS, *Amazon QLDB Verifiable Data*,
2019, deprecated for new customers Jul 2024 but the pattern survives in
RDS and Timestream). Hyperledger Fabric uses the same primitive in its
peer ledger blocks (Hyperledger Fabric, *Ledger architecture*, v2.5,
2024). Bitcoin's contribution — proof-of-work consensus — is the part
SaaS audit logs do not need.

**Gap detection.** Each record stores a monotonically-increasing
\`sequence\` plus the predecessor's hash. A missing event breaks both
invariants: the sequence has a gap, and the chain hash on event N+1
no longer matches \`H(event_N)\`.

**Tamper proof.** The verifier walks the chain forward, recomputing
\`H(prev || canonical(event))\`. Any single mutation diverges the chain
from that point onward, and the divergence point is reported. The
periodic Merkle root, written to a separate object with its own
retention policy, lets an auditor spot-check a 24-hour window without
walking the full chain.

## WORM storage options for SaaS in 2026

Three viable backends. All are auditor-recognised; the difference is
operational ergonomics.

| Backend | Lock model | Audit-friendliness | Cost (warm) |
|---|---|---|---|
| **S3 Object Lock — compliance mode** (Truehound default; **shipped 2026-05** in [\`bff/src/persistence/audit-archive.js\`](../bff/src/persistence/audit-archive.js); activated by \`ATLAS_S3_AUDIT_BUCKET\`) | Per-object retention; even root cannot delete or shorten until expiry | SEC 17a-4(f) attested by Cohasset; FINRA, CFTC | $0.023/GB-mo + write request fees |
| **S3 Object Lock — governance mode** | Per-object retention, but \`s3:BypassGovernanceRetention\` can override | Most SOC 2 auditors accept; not SEC 17a-4 sufficient | Same as compliance |
| **Azure Blob immutability — locked time-based** | Container or version-level; *unlocked* policies can be shortened | Cohasset SEC 17a-4(f); FINRA; CFTC | $0.018/GB-mo |
| **GCS Bucket Lock** | Bucket-level retention; cannot be shortened once locked | SEC 17a-4(f) attested 2018 | $0.020/GB-mo |

References: AWS, *S3 Object Lock — Compliance and Governance modes*,
2024; Microsoft, *Immutable storage for blob data — time-based
retention*, 2024; Google Cloud, *Bucket Lock*, 2024; Cohasset
Associates assessments under SEC 17 CFR §240.17a-4(f), FINRA Rule 4511,
CFTC 17 CFR §1.31(c)–(d).

**Recommendation:** S3 Object Lock in compliance mode for tenants on
AWS; Azure Immutable Blob (locked time-based) for Azure tenants; GCS
Bucket Lock for GCP. Truehound's repository pattern already supports
swapping the backend per-tenant.

**What to never do:** filesystem permissions on a regular volume.
Unix \`chattr +a\` is not WORM — root can \`chattr -a\`. Auditors know.

## Tamper-evidence vs tamper-resistance

| Property | Hash-chain alone | Hash-chain + WORM | + HSM-anchored root |
|---|---|---|---|
| Detect single-record mutation | yes | yes | yes |
| Detect bulk re-write of the chain | no | yes (object would need to be re-uploaded after lock expiry) | yes |
| Detect collusion by Truehound operators | no | partial | yes — root signature requires HSM ceremony |
| Required for SOC 2 CC7.2 | not specified | sufficient | sufficient |
| Required for ISO 27001 A.8.15 | not specified | sufficient | sufficient |
| Required for HIPAA §164.312(b) | not specified | sufficient | sufficient |
| Required for SEC 17a-4(f) | no | yes | yes |
| Required for highest-tier finance | no | borderline | yes |

The Trust Services Criteria (AICPA, 2017, revised 2022) at CC7.2 ask
for "monitoring of system components and the operation of those
components for anomalies that are indicative of malicious acts,
natural disasters, and errors." The criteria do not name a primitive.
Auditors map "the log cannot be altered without detection" to
hash-chain + WORM in practice. ISO/IEC 27001:2022 Annex A.8.15
("Logging") is similarly outcome-based.

HSM anchoring becomes worth the operational cost only when the threat
model includes the Truehound operations team. For most SaaS deals it does
not. Ship hash-chain + WORM; offer HSM-anchored roots as an enterprise
add-on.

## WORM sink contract — interface Truehound should add

The contract goes into \`src/data/repositories/types.ts\` next to the
existing \`AuditRepository\`. The current repo has a read-only audit
port; the sink is the missing write side.

\`\`\`ts
export interface AuditSink {
  /**
   * Append an event. Returns the sealed event with chain fields
   * populated. Must be totally ordered per (tenantId, sequence).
   * Idempotent on (eventId): a retry with the same id is a no-op.
   */
  append(event: AuditEventInput): Promise<SealedAuditEvent>;

  /**
   * Read a contiguous range. Used by verifier and by the read-side
   * AuditRepository implementation.
   */
  range(params: {
    tenantId: string;
    fromSeq: number;
    toSeq: number;
  }): Promise<SealedAuditEvent[]>;

  /**
   * Latest Merkle root for the named window. The root is what an
   * auditor recomputes to verify a slice without walking the chain.
   */
  latestRoot(window: "minute" | "hour" | "day"): Promise<MerkleRoot>;
}
\`\`\`

The in-memory implementation keeps today's demo behaviour. The HTTP
implementation calls the BFF, which writes to S3 Object Lock and
maintains a DuckDB index.

## The exact algorithm Truehound should pick

**Hash:** SHA-256. FIPS 140-3 validated; named in NIST SP 800-107 Rev 1
and SP 800-185. BLAKE3 is faster per-byte (Aumasson et al., 2020) but
procurement still asks "do you use SHA-256?" by name; the throughput
delta does not matter at audit-event volumes.

**Canonical encoding:** RFC 8785 JSON Canonicalization Scheme (JCS).
Required so the verifier and the writer compute the same hash even
when JSON serialisers reorder keys.

**Chain construction:** per-event, per-tenant.

\`\`\`
prevHash_0 = SHA-256("atlas:audit:v1:" || tenantId)   // genesis
seq_0 = 0

for each event e_n (n >= 1):
  payload_n     = JCS(e_n.body)
  recordHash_n  = SHA-256("atlas:rec:" || prevHash_{n-1} || payload_n
                          || u64(seq_n) || u64(at_ms_n))
  e_n.prevHash  = prevHash_{n-1}
  e_n.hash      = recordHash_n
  e_n.seq       = seq_n
  prevHash_n    = recordHash_n
\`\`\`

Domain-separation prefixes (\`"atlas:audit:v1:"\`, \`"atlas:rec:"\`) are
RFC 9380 best practice; they prevent cross-protocol hash collisions if
the same key material is reused for another purpose later.

**Per-minute Merkle root.** Every minute, the writer takes the
sequence range \`[firstSeqInMinute, lastSeqInMinute]\`, builds a binary
Merkle tree over \`recordHash\` values (RFC 6962 hashing rules — leaf
prefix \`0x00\`, node prefix \`0x01\`), and writes
\`{ window: "2026-05-09T14:23Z", firstSeq, lastSeq, root }\` to a
second WORM object. The root object is small (< 100 bytes); per-tenant
yearly storage is under 60 MB.

**Daily anchor (optional).** The day's last Merkle root is signed with
the tenant's KMS key (RSA-PSS-SHA-256 or Ed25519). Auditors who care
about operator collusion have their evidence; tenants who do not pay
nothing extra.

**Why per-event chain *and* per-minute root.** The chain catches
single-record mutation cheaply. The Merkle root lets an auditor
verify "the log between 14:23 and 14:24 today contains exactly these
N records and no others" without walking the full chain. Together they
match the AWS QLDB digest model.

## Verifier protocol

Truehound ships a CLI (\`atlas-audit-verify\`) and an HTTP endpoint
(\`/api/audit/verify\`). Both run the same algorithm.

1. **Fetch the slice.** \`GET /audit/range?from=<seq>&to=<seq>\` returns
   the sealed events.
2. **Walk the chain.** Recompute \`recordHash\` per the construction
   rule above. Fail at the first mismatch and report \`(seq, expected,
   actual)\`.
3. **Recompute the Merkle roots** for any complete window inside the
   slice. Compare against the root object in WORM. Fail on mismatch.
4. **Optional: verify the daily anchor signature** against the
   tenant's published verification key (a JWKS endpoint at
   \`/.well-known/atlas-audit-keys\`).
5. **Output an attestation** — a short JSON document the auditor can
   attach to their workpaper:

\`\`\`json
{
  "tenantId": "acme",
  "verifiedRange": { "fromSeq": 1, "toSeq": 184552 },
  "chainOk": true,
  "rootsOk": true,
  "anchorsOk": true,
  "verifiedAt": "2026-05-09T14:30:00Z"
}
\`\`\`

A customer's security team can run the verifier against their own
slice without Truehound intervention. This is the property that turns
"we say we have audit integrity" into "you can prove we have audit
integrity" — the difference matters in vendor-security review.

## PII handling — keep / hash / redact decision tree

The conflict: SOC 2 wants every actor recorded; GDPR Article 17 wants
that record erasable on request. Hash-chain immutability appears to
forbid both at once. The standard resolution is **pseudonymisation at
write** — never put raw identifiers into the immutable record.

Decision tree, applied per field:

| Field | Default | Rationale |
|---|---|---|
| \`actor.id\` (email) | **Hash** with HMAC-SHA-256 keyed by tenant secret | GDPR Art. 17 erasable by destroying the secret; chain still verifies |
| \`actor.role\` | Keep | Not personal data; required for control mapping |
| \`entity.id\`, \`entity.kind\` | Keep | Operational identifiers, not personal data |
| \`cause\` (free text) | **Redact** with a regex for emails / IPs at write time | "Log everything" loses to "log nothing identifying" |
| \`before\` / \`after\` payloads | **Diff with allowlisted fields** | Never store raw vendor payloads; only the deltas Truehound needs |
| \`correlationId\` | Keep | Synthetic; not personal |
| \`ip\`, \`userAgent\` | **Hash + truncate** (IPv4 /24, IPv6 /48) | Recital 30 considers IP personal data; truncation breaks identifiability while preserving anomaly-detection signal |

For full erasure, Truehound destroys the per-tenant HMAC key and the
\`actorId → hash\` map. The chain still verifies — the hash is a
domain-separated SHA-256 over canonical JSON, no plaintext required.
This is the **Lethe-style cryptographic redaction** pattern (Khazaei
& Vaudenay, *On the security of cryptographic erasure*, 2020;
Reardon, *Secure Data Deletion*, 2016).

## Retention recommendation

Defaults driven from \`tenantConfig.compliance\`:

| Preset | Retention | Driver |
|---|---|---|
| \`default\` | 395 days (13 months) | Generous coverage of a 12-month SOC 2 observation window |
| \`hipaa\` | 2192 days (6 years) | 45 CFR §164.530(j)(2) |
| \`pci\` | 365 days online + 365 days archive | PCI DSS v4.0.1 Req 10.5.1 |
| \`sox\` | 2557 days (7 years) | SOX §802 (18 USC §1519) |
| \`fedramp_moderate\` | 1095 days (3 years) | NIST SP 800-53 Rev 5 AU-11 |
| \`gdpr_minimal\` | 90 days | Storage-limitation principle, Art. 5(1)(e) |

Implementation: the WORM retention timer is set per-object on write.
S3 Object Lock supports per-object retention dates, so a tenant on the
\`hipaa\` preset gets 6-year locks even if the default policy is 13
months. Retention extension is allowed; shortening is not (compliance
mode).

## Append-only does not mean unsearchable

Truehound pages need to query the audit log by actor, entity, kind, and
time range. Three patterns work; the third is the right one for
Truehound's three-tier cache architecture (see DEPLOYMENT.md).

1. **Linear scan.** Walk the WORM tier. Acceptable up to ~100k events
   per tenant; too slow above that.
2. **External index, full-text.** OpenSearch / Elasticsearch over the
   replicated stream. Powerful, expensive, mutable.
3. **External index, log-structured.** A DuckDB table with
   \`(seq, eventId, at, actorIdHash, entityId, kind, objectKey)\`
   pointing at the WORM object. The index is rebuildable from the
   immutable log; its mutability is irrelevant to integrity. This is
   the path Truehound should take — it reuses the warm tier already in
   the architecture.

The pattern matches what production audit systems ship: Vector ships
events to an indexed store while a separate sink writes to S3
(Datadog, *Vector Reference*, 2024); OpenObserve uses a log-structured
columnar index with object-store backing (OpenObserve, *Architecture
Reference*, v0.10, 2024); Grafana Loki keeps an inverted index and
chunks separately (Grafana Labs, *Loki Architecture*, 2024).

## Code-side TODO

Concrete changes against the current repo state. None of these break
the demo — they layer on top.

### \`src/data/truth/types.ts\`

1. Extend \`AuditEvent\` with the chain fields:

\`\`\`ts
export interface SealedAuditEvent extends AuditEvent {
  tenantId: string;
  seq: number;
  prevHash: string;   // hex
  hash: string;       // hex
  /** Set when the event has been folded into a Merkle root. */
  rootWindow?: string;
}
\`\`\`

2. Pseudonymise the actor type:

\`\`\`ts
export interface AuditActor {
  kind: AuditActorKind;
  /** HMAC-SHA-256(actorId, tenantSecret) — hex, 64 chars. */
  idHash: string;
  /** Optional plaintext for the demo path only. Never persisted in WORM. */
  idPlaintext?: string;
  role?: string;
}
\`\`\`

### \`src/data/repositories/types.ts\`

3. Add the \`AuditSink\` interface alongside the existing read-side
   \`AuditRepository\`. Add \`auditSink: AuditSink\` to
   \`RepositoryContainer\`.

### New files

4. \`src/data/audit/chain.ts\` — pure functions:
   \`genesisHash(tenantId)\`, \`sealEvent(prev, event)\`, \`verifyChain(events)\`,
   \`merkleRoot(hashes)\`. No I/O. Easy to unit-test.
5. \`src/data/audit/canonical.ts\` — RFC 8785 JCS implementation
   (~80 lines).
6. \`src/data/audit/sink.inMemory.ts\` — implements \`AuditSink\`,
   maintains the chain in memory plus localStorage. The demo's
   \`actionStore\` calls this instead of writing audit directly.
7. \`src/data/audit/sink.http.ts\` — calls the BFF.
8. \`src/data/audit/verifier.ts\` — the chain + Merkle verifier. Used
   by the CLI and the \`/audit/verify\` BFF endpoint.
9. \`src/data/audit/redact.ts\` — email / IP / UUID redaction for the
   \`cause\` field.

### \`src/data/truth/actions.ts\`

10. Replace the body of \`emit(...)\` with a call to
    \`repositories.auditSink.append(...)\`. The sink is responsible for
    chain sealing; \`actions.ts\` no longer touches the audit storage
    keys directly. The localStorage \`audit\` array becomes a
    write-through cache, not the source of truth.

### \`src/tenant/tenant.config.ts\`

11. Add a \`compliance\` block:

\`\`\`ts
compliance: {
  auditRetentionDays: 395,        // 13 months
  auditPreset: "default",         // | "hipaa" | "pci" | "sox" | "fedramp_moderate" | "gdpr_minimal"
  allowPhi: false,
  hsmAnchor: false,
  region: "us-east-1",
}
\`\`\`

### Tests

12. \`src/data/audit/chain.test.ts\` — round-trip an event sequence;
    mutate a record; assert the verifier reports the right \`seq\`.
13. \`src/data/audit/canonical.test.ts\` — RFC 8785 vectors.
14. \`src/data/audit/redact.test.ts\` — emails, IPv4, IPv6, UUIDs.
15. Update \`src/data/truth/actions.test.ts\` to assert each emitted
    event is sealed (non-empty \`hash\`, monotonic \`seq\`, valid chain).

### BFF / DEPLOYMENT.md

16. The BFF gains \`POST /audit/append\`, \`GET /audit/range\`,
    \`GET /audit/roots\`, \`POST /audit/verify\`, plus a
    \`/.well-known/atlas-audit-keys\` JWKS endpoint.
17. Per-tenant S3 bucket prefix: \`s3://atlas-audit-<tenant>/events/\`
    with Object Lock compliance mode at the configured retention.
18. Per-minute root object at \`s3://atlas-audit-<tenant>/roots/<window>.json\`.

## Citations

- AICPA, *2017 Trust Services Criteria for Security, Availability,
  Processing Integrity, Confidentiality, and Privacy*, revised 2022.
- ISO/IEC 27001:2022, *Information security management systems —
  Requirements*, Annex A.8.15 (Logging).
- 45 CFR §164.312(b) and §164.530(j)(2), HIPAA Security and Privacy
  Rules.
- PCI Security Standards Council, *PCI DSS v4.0.1*, June 2024,
  Requirement 10.5.
- NIST SP 800-53 Rev 5, *Security and Privacy Controls*, 2020,
  AU-9 / AU-10 / AU-11.
- NIST SP 800-92, *Guide to Computer Security Log Management*, 2006.
- NIST SP 800-107 Rev 1, *Recommendation for Applications Using
  Approved Hash Algorithms*, 2012.
- NIST FIPS 180-4, *Secure Hash Standard*, 2015.
- RFC 6962, *Certificate Transparency*, B. Laurie et al., 2013 — Merkle
  hashing rules.
- RFC 8785, *JSON Canonicalization Scheme (JCS)*, A. Rundgren et al.,
  2020.
- RFC 9380, *Hashing to Elliptic Curves* — domain-separation guidance,
  2023.
- AWS, *Amazon QLDB Verifiable Data*, 2019; deprecation notice for new
  customers July 2024 — pattern survives in the audit-log domain.
  https://docs.aws.amazon.com/qldb/latest/developerguide/verification.html
- AWS, *S3 Object Lock — Compliance and Governance modes*, 2024.
  https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
- Microsoft, *Immutable storage for blob data*, 2024.
  https://learn.microsoft.com/azure/storage/blobs/immutable-storage-overview
- Google Cloud, *Bucket Lock*, 2024.
  https://cloud.google.com/storage/docs/bucket-lock
- Cohasset Associates, *S3 Object Lock — SEC 17a-4(f) Assessment*, 2018.
- Hyperledger Fabric, *Ledger Architecture*, v2.5, 2024.
  https://hyperledger-fabric.readthedocs.io/en/release-2.5/ledger/ledger.html
- Nakamoto, S., *Bitcoin: A Peer-to-Peer Electronic Cash System*, 2008
  — origin of the production hash-chain pattern.
- SEC 17 CFR §240.17a-4(f), FINRA Rule 4511, CFTC 17 CFR §1.31(c)–(d)
  — WORM storage requirements for regulated record retention.
- SOX §802, codified at 18 USC §1519 — 7-year retention for audit
  records.
- Aumasson, J.-P., Neves, S., Wilcox-O'Hearn, Z., Winnerlein, C.,
  *BLAKE3*, 2020.
- Reardon, J., *Secure Data Deletion*, Springer, 2016 — cryptographic
  erasure as a replacement for physical destruction.
- Khazaei, S., Vaudenay, S., *On the security of cryptographic
  erasure*, 2020.
- Datadog, *Vector Reference Architecture*, 2024.
  https://vector.dev/docs/
- OpenObserve, *Architecture*, v0.10, 2024.
  https://openobserve.ai/docs/architecture/
- Grafana Labs, *Loki Architecture*, 2024.
  https://grafana.com/docs/loki/latest/get-started/architecture/
- Regulation (EU) 2016/679 (GDPR) Articles 5, 17, 30, and Recital 30.
`;export{e as default};