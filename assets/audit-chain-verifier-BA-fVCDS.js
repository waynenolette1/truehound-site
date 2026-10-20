var e=`/**
 * Truehound Audit Chain — reference verifier (Conformance Level A).
 *
 * Zero runtime dependencies. Uses WebCrypto SubtleCrypto SHA-256.
 * Works in Node 20+, Deno, Bun, Cloudflare Workers, modern browsers.
 *
 * Spec: ../specs/AUDIT_CHAIN.md (v0.1).
 *
 * Usage:
 *
 *   import { verifyChain } from "./audit-chain-verifier";
 *   const result = await verifyChain(exportJson);
 *   if (!result.ok) console.error(result.failure);
 *
 * The verifier reproduces every \`thisHash\` from the canonical
 * preimage, walks the \`prevHash\` linkage, and checks witness
 * coverage on the kinds that require it. Failures are returned in
 * a structured form so callers can render an "Chain broken at #N"
 * UI like Truehound's \`/audit\` page.
 *
 * License: Apache-2.0.
 */

// ─── Types ────────────────────────────────────────────────────────

export interface AuditEvent {
  seq: number;
  at: string;
  kind: string;
  actor: { kind: "user" | "system" | "agent"; id: string };
  target: { kind: string; id: string; name?: string };
  summary: string;
  metadata?: Record<string, unknown>;
  witnesses?: Witness[];
  prevHash: string;
  thisHash: string;
}

export interface Witness {
  actor: { kind: "user" | "system" | "agent"; id: string };
  at: string;
  role?: "approver" | "reviewer" | "observer";
  signature?: string;
}

export interface ExportEnvelope {
  spec: "atlas-audit-chain/v0.1";
  tenantId: string;
  exportedAt: string;
  exportedBy: { kind: "user" | "system" | "agent"; id: string };
  range: { start: number; end: number };
  redacted?: { seq: number; field: string }[];
  events: AuditEvent[];
  signature?: string | null;
}

export type VerifyResult =
  | { ok: true; events: number; head: string }
  | { ok: false; failure: VerifyFailure };

export interface VerifyFailure {
  kind:
    | "spec_mismatch"
    | "empty_export"
    | "non_contiguous"
    | "wrong_genesis"
    | "hash_mismatch"
    | "prev_hash_mismatch"
    | "missing_witness"
    | "self_witness";
  seq?: number;
  expected?: string;
  actual?: string;
  detail?: string;
}

// ─── Spec constants ───────────────────────────────────────────────

const GENESIS_PREVHASH = "0".repeat(64);

const WITNESS_REQUIRED_KINDS: ReadonlySet<string> = new Set([
  "action.approved",
  "action.merged",
  "action.executed",
  "subscription.created",
  "tenant.reset",
  "audit.exported",
]);

// ─── Public API ───────────────────────────────────────────────────

export async function verifyChain(envelope: ExportEnvelope): Promise<VerifyResult> {
  if (envelope.spec !== "atlas-audit-chain/v0.1") {
    return { ok: false, failure: { kind: "spec_mismatch", detail: envelope.spec } };
  }
  if (!Array.isArray(envelope.events) || envelope.events.length === 0) {
    return { ok: false, failure: { kind: "empty_export" } };
  }

  // 1. Sort by seq + check contiguous.
  const events = [...envelope.events].sort((a, b) => a.seq - b.seq);
  for (let i = 1; i < events.length; i += 1) {
    if (events[i].seq !== events[i - 1].seq + 1) {
      return {
        ok: false,
        failure: { kind: "non_contiguous", seq: events[i].seq, detail: \`prior seq \${events[i - 1].seq}\` },
      };
    }
  }

  // 2. Genesis prevHash sanity (only when start === 1).
  if (envelope.range.start === 1 && events[0].prevHash !== GENESIS_PREVHASH) {
    return {
      ok: false,
      failure: { kind: "wrong_genesis", seq: events[0].seq, expected: GENESIS_PREVHASH, actual: events[0].prevHash },
    };
  }

  // 3. For every event: recompute hash, check chain link, check witnesses.
  let lastHash = events[0].prevHash;
  for (const event of events) {
    if (event.prevHash !== lastHash) {
      return {
        ok: false,
        failure: { kind: "prev_hash_mismatch", seq: event.seq, expected: lastHash, actual: event.prevHash },
      };
    }
    const expected = await computeHash(event);
    if (expected !== event.thisHash) {
      return {
        ok: false,
        failure: { kind: "hash_mismatch", seq: event.seq, expected, actual: event.thisHash },
      };
    }
    if (WITNESS_REQUIRED_KINDS.has(event.kind)) {
      if (!event.witnesses || event.witnesses.length === 0) {
        return { ok: false, failure: { kind: "missing_witness", seq: event.seq } };
      }
      const witnessIds = event.witnesses.map((w) => \`\${w.actor.kind}:\${w.actor.id}\`);
      const actorId = \`\${event.actor.kind}:\${event.actor.id}\`;
      if (!witnessIds.some((id) => id !== actorId)) {
        return { ok: false, failure: { kind: "self_witness", seq: event.seq } };
      }
    }
    lastHash = event.thisHash;
  }

  return { ok: true, events: events.length, head: lastHash };
}

// ─── Hash + canonicalisation ─────────────────────────────────────

/** Compute the SHA-256 of an event per spec § 4.1. */
export async function computeHash(event: AuditEvent): Promise<string> {
  const preimage = canonicalPreimage(event);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(preimage));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function canonicalPreimage(event: AuditEvent): string {
  return [
    event.prevHash,
    String(event.seq),
    event.at,
    event.kind,
    canonicalJson(event.actor),
    canonicalJson(event.target),
    event.summary,
    event.metadata !== undefined ? canonicalJson(event.metadata) : "null",
    event.witnesses !== undefined ? canonicalJson(event.witnesses) : "null",
  ].join("|");
}

/**
 * RFC-8785-style JSON canonicalisation, restricted to the subset
 * Truehound events use. Object keys sorted lexicographically; numbers
 * formatted in shortest round-trip; strings JSON-escaped.
 */
function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite number in canonical JSON");
    return String(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return (
      "{" +
      keys
        .map((k) => \`\${JSON.stringify(k)}:\${canonicalJson(obj[k])}\`)
        .join(",") +
      "}"
    );
  }
  throw new Error(\`unsupported value in canonical JSON: \${typeof value}\`);
}
`;export{e as default};