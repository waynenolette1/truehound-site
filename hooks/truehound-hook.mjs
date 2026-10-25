#!/usr/bin/env node
/**
 * Truehound MCP hook. Open source on purpose: read every line before you
 * install it. It has no dependencies and needs Node 18 or newer.
 *
 * The agent client runs it before each tool call. It sends one small JSON
 * request to your Truehound workspace and turns the answer (allow, deny or
 * ask) into the client's own hook output. Nothing is rerouted: the tool call
 * still goes straight from the client to the MCP server.
 *
 *   What it sends:  { client, server, tool, input (a summary, at most 2,000
 *                   characters, with secrets replaced by [REDACTED] on this
 *                   machine first), redactions (how many), user, host, session }
 *   How it signs:   Authorization: Bearer <your workspace hook token>, read
 *                   from a config file (mode 600), never from a URL.
 *   How fast:       the request is abandoned after 250 ms (TRUEHOUND_TIMEOUT_MS,
 *                   at most 280). An allow is cached for the TTL the workspace
 *                   sets (60 s by default, 0 to ask every time), so a repeated
 *                   call makes no request at all. A policy change reaches a
 *                   laptop within that TTL, and clears its cache at the next
 *                   request.
 *   If unreachable: the workspace's fail mode decides. Open (the default)
 *                   lets the call run and keeps a record to send next time;
 *                   closed denies it. A policy can set its own fail mode.
 *
 * Clients (each one's own documented hook):
 *   claude-code  PreToolUse        https://code.claude.com/docs/en/hooks
 *   cursor       beforeMCPExecution https://cursor.com/docs/hooks
 *   windsurf     pre_mcp_tool_use  https://docs.devin.ai/desktop/cascade/hooks
 *   copilot      preToolUse        https://code.visualstudio.com/docs/copilot/customization/hooks
 *   codex        PreToolUse        https://learn.chatgpt.com/docs/hooks
 *
 * Commands:
 *   node truehound-hook.mjs --client claude-code         run as the hook (reads the event on stdin)
 *   node truehound-hook.mjs install --client claude-code [--api URL] [--user EMAIL] [--all-tools]
 *        --all-tools also checks built-in tools (Claude Code and Codex: every
 *        tool, matcher "*"; Cursor: beforeShellExecution). They arrive as
 *        server "builtin", for example builtin/Bash with the command as input.
 *        reads the token from TRUEHOUND_HOOK_TOKEN or asks for it, writes
 *        ~/.truehound/hook.json (mode 600), copies this file to
 *        ~/.truehound/truehound-hook.mjs and adds the hook to the client's
 *        user config. Run it again to update; it never adds a second entry.
 *   node truehound-hook.mjs print-config --client cursor [--managed]
 *        prints the client config to deploy by MDM instead.
 *   node truehound-hook.mjs uninstall --client claude-code
 */

export const VERSION = "1.0.0";
export const MAX_INPUT = 2000;
export const DEFAULT_TIMEOUT_MS = 250;
export const MAX_TIMEOUT_MS = 280;
export const CLIENTS = ["claude-code", "cursor", "windsurf", "copilot", "codex"];

// ── Redaction (the server runs the same function again before it stores anything) ──

const SECRET_KEY = /^(pass(word|wd|phrase)?|pwd|secret|.*_secret|client_?secret|token|.*_token|access_?token|refresh_?token|id_?token|api_?key|apikey|x-api-key|access_?key(_id)?|secret_?access_?key|private_?key|authorization|auth|credentials?|cookie|set-cookie|session(_?id)?|signature|otp|totp|pin|ssn|card_?number|cvv|dsn|connection_?string)$/i;

const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(-----END [A-Z ]*PRIVATE KEY-----|$)/g,
  /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bglpat-[A-Za-z0-9_-]{20,}\b/g,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g,
  /\b(sk|rk|pk)_(live|test)_[A-Za-z0-9]{16,}\b/g,
  /\bwhsec_[A-Za-z0-9]{16,}\b/g,
  /\bsk-ant-[A-Za-z0-9_-]{20,}/g,
  /\bsk-(proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}/g,
  /\bAIza[0-9A-Za-z_-]{35}\b/g,
  /\bya29\.[0-9A-Za-z_-]{20,}/g,
  /\bth_(hook|mcp|api)_[A-Za-z0-9_-]{16,}/g,
  /\bnpm_[A-Za-z0-9]{36}\b/g,
  /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
  /\b(Bearer|Basic|Token)\s+[A-Za-z0-9._~+/=-]{12,}/gi,
];
// key=value, key: value, "key": "value" with a secret-looking key.
const SECRET_ASSIGN = /(["']?)\b((?:[A-Za-z0-9]+[_-])*(?:pass(?:word|wd|phrase)?|pwd|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|client[_-]?secret|authorization|credentials?|cookie|session[_-]?id))\1(\s*[:=]\s*)(["']?)([^"'\s,;&}]{4,})\4/gi;
// scheme://user:password@host
const URL_CREDS = /\b([a-z][a-z0-9+.-]*:\/\/[^\s:/@]+):([^\s@/]{1,200})@/gi;

const MARK = "[REDACTED]";

/** Replace secrets in a string. Returns { text, count }. */
export function redactText(input) {
  let text = String(input ?? "");
  let count = 0;
  for (const re of SECRET_PATTERNS) {
    text = text.replace(re, (m, p1) => {
      count += 1;
      return /^(Bearer|Basic|Token)$/i.test(p1 ?? "") ? `${p1} ${MARK}` : MARK;
    });
  }
  text = text.replace(URL_CREDS, (_m, head) => {
    count += 1;
    return `${head}:${MARK}@`;
  });
  text = text.replace(SECRET_ASSIGN, (m, q, key, sep, vq, value) => {
    if (value === MARK || value.startsWith("[REDACTED")) return m;
    count += 1;
    return `${q}${key}${q}${sep}${vq}${MARK}${vq}`;
  });
  return { text, count };
}

/** Replace secret values in any JSON value: secret-named keys whole, and secrets inside strings. */
export function redactValue(value, depth = 0) {
  let count = 0;
  const walk = (v, d) => {
    if (d > 12) return "[too deep]";
    if (typeof v === "string") {
      const r = redactText(v);
      count += r.count;
      return r.text;
    }
    if (Array.isArray(v)) return v.slice(0, 200).map((x) => walk(x, d + 1));
    if (v && typeof v === "object") {
      const out = {};
      for (const [k, x] of Object.entries(v).slice(0, 200)) {
        if (SECRET_KEY.test(k) && (typeof x === "number" || (typeof x === "string" && x !== ""))) {
          count += 1;
          out[k] = MARK;
        } else out[k] = walk(x, d + 1);
      }
      return out;
    }
    return v;
  };
  const out = walk(value, depth);
  return { value: out, count };
}

/** The input summary sent and stored: redacted JSON, at most MAX_INPUT characters. */
export function summarizeInput(input) {
  let v = input;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      /* a plain string */
    }
  }
  const r = redactValue(v ?? {});
  const json = typeof r.value === "string" ? r.value : JSON.stringify(r.value);
  // A second pass over the joined text catches a secret split across fields.
  const again = redactText(json ?? "");
  const text = again.text.length > MAX_INPUT ? `${again.text.slice(0, MAX_INPUT - 1)}…` : again.text;
  return { text, redactions: r.count + again.count };
}

// ── Client formats ──────────────────────────────────────────────────────

/** Split an "mcp__server__tool" name. Built-in tools (Bash, Edit) come back as server "builtin". */
export function splitToolName(name) {
  const s = String(name ?? "");
  if (!s.startsWith("mcp__")) return { server: "builtin", tool: s || "unknown" };
  const rest = s.slice(5);
  const i = rest.indexOf("__");
  if (i < 0) return { server: rest || "unknown", tool: "unknown" };
  return { server: rest.slice(0, i) || "unknown", tool: rest.slice(i + 2) || "unknown" };
}

/** Read one client's hook event into { server, tool, input, session, user? }. */
export function parseEvent(client, ev) {
  ev = ev && typeof ev === "object" ? ev : {};
  switch (client) {
    case "cursor": {
      // beforeShellExecution (installed with --all-tools): the command.
      if (ev.hook_event_name === "beforeShellExecution")
        return { server: "builtin", tool: "Shell", input: { command: ev.command, cwd: ev.cwd }, session: ev.conversation_id ?? null, user: ev.user_email ?? null };
      // beforeMCPExecution: tool_name, tool_input, mcp_server_name, url or command, user_email.
      const split = splitToolName(ev.tool_name);
      return {
        server: String(ev.mcp_server_name || (split.server !== "builtin" ? split.server : "") || "unknown"),
        tool: String(split.server === "builtin" ? ev.tool_name || "unknown" : split.tool),
        input: ev.tool_input,
        session: ev.conversation_id ?? null,
        user: ev.user_email ?? null,
        target: ev.mcp_server_url || ev.url || ev.command || null,
      };
    }
    case "windsurf": {
      const ti = ev.tool_info ?? {};
      return { server: String(ti.mcp_server_name || "unknown"), tool: String(ti.mcp_tool_name || "unknown"), input: ti.mcp_tool_arguments, session: ev.trajectory_id ?? null };
    }
    case "copilot": {
      // The compatible PreToolUse alias sends snake_case; the native preToolUse sends toolName and toolArgs.
      const name = ev.tool_name ?? ev.toolName;
      return { ...splitToolName(name), input: ev.tool_input ?? ev.toolArgs, session: ev.session_id ?? ev.sessionId ?? null };
    }
    default:
      // claude-code and codex: tool_name "mcp__server__tool", tool_input.
      return { ...splitToolName(ev.tool_name), input: ev.tool_input, session: ev.session_id ?? null };
  }
}

/**
 * Turn a decision into the client's hook output: { stdout, stderr, code }.
 * An allow says nothing to Claude Code, Codex or Copilot, so their own
 * permission prompts still apply; Truehound only adds a no.
 */
export function formatDecision(client, decision, reason) {
  const why = `Truehound: ${reason || decision}`;
  switch (client) {
    case "cursor":
      return {
        stdout: JSON.stringify(decision === "allow" ? { permission: "allow" } : { permission: decision, user_message: why, agent_message: why }),
        stderr: "",
        code: 0,
      };
    case "windsurf":
      // Windsurf blocks on exit code 2 and has no "ask": ask is a deny with the reason.
      return decision === "allow" ? { stdout: "", stderr: "", code: 0 } : { stdout: "", stderr: why, code: 2 };
    case "copilot":
      if (decision === "allow") return { stdout: "{}", stderr: "", code: 0 };
      return { stdout: JSON.stringify({ permissionDecision: decision, permissionDecisionReason: why }), stderr: "", code: 0 };
    case "codex":
      // Codex documents deny, not ask: ask is a deny that says a person must approve.
      if (decision === "allow") return { stdout: "", stderr: "", code: 0 };
      return {
        stdout: JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: decision === "ask" ? `${why} (needs a person's approval)` : why } }),
        stderr: "",
        code: 0,
      };
    default:
      if (decision === "allow") return { stdout: "", stderr: "", code: 0 };
      return { stdout: JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: decision, permissionDecisionReason: why } }), stderr: "", code: 0 };
  }
}

// ── Cache ───────────────────────────────────────────────────────────────

export function cacheKey(client, call, scope, inputText, hash) {
  return [client, call.server, call.tool, scope === "input" ? hash(inputText) : ""].join("|");
}

/** A cached allow still fresh for this call, or null. Only allows are ever cached. */
export function cachedAllow(cache, keys, nowMs) {
  for (const k of keys) {
    const e = cache?.entries?.[k];
    if (e && e.decision === "allow" && e.until > nowMs) return e;
  }
  return null;
}

/** The fail mode to use when the server cannot answer: the last one the server named for this tool, else the workspace default, else open. */
export function failModeFor(cache, call) {
  const k = `${call.server}|${call.tool}`;
  return cache?.failModes?.[k] ?? cache?.failModes?.[`${call.server}|*`] ?? cache?.defaults?.failMode ?? "open";
}

// ── Runtime (Node only; nothing below runs when the Worker imports the redaction) ──

async function node() {
  const [fs, os, path, crypto] = await Promise.all([import("node:fs"), import("node:os"), import("node:path"), import("node:crypto")]);
  return { fs, os, path, crypto };
}

function argValue(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

function home(n) {
  return process.env.TRUEHOUND_HOME || n.path.join(n.os.homedir(), ".truehound");
}

function managedConfigPaths() {
  if (process.platform === "darwin") return ["/Library/Application Support/Truehound/hook.json"];
  if (process.platform === "win32") return ["C:\\ProgramData\\Truehound\\hook.json"];
  return ["/etc/truehound/hook.json"];
}

function readJsonFile(n, file, fallback) {
  try {
    return JSON.parse(n.fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJsonFile(n, file, value, mode = 0o600) {
  n.fs.mkdirSync(n.path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  n.fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { mode });
  n.fs.renameSync(tmp, file);
}

function loadConfig(n) {
  const explicit = process.env.TRUEHOUND_HOOK_CONFIG;
  const files = explicit ? [explicit] : [n.path.join(home(n), "hook.json"), ...managedConfigPaths()];
  for (const f of files) {
    const c = readJsonFile(n, f, null);
    if (c && c.api && c.token) return { ...c, file: f };
  }
  return null;
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) return resolve("");
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => {
      data += d;
      if (data.length > 1_000_000) process.stdin.destroy();
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("close", () => resolve(data));
    process.stdin.on("error", () => resolve(data));
  });
}

function emit(out) {
  if (out.stdout) process.stdout.write(out.stdout);
  if (out.stderr) process.stderr.write(out.stderr);
  process.exitCode = out.code;
}

/** Run as the hook. */
export async function runHook(argv) {
  const client = CLIENTS.includes(argValue(argv, "--client")) ? argValue(argv, "--client") : "claude-code";
  const n = await node();
  const started = performance.now();
  let ev;
  try {
    ev = JSON.parse((await readStdin()) || "{}");
  } catch {
    ev = {};
  }
  const call = parseEvent(client, ev);
  const config = loadConfig(n);
  // Not installed: say nothing, so the client behaves as if there were no hook.
  if (!config) return emit(formatDecision(client, "allow", ""));
  const dir = home(n);
  const cacheFile = n.path.join(dir, "cache.json");
  const spoolFile = n.path.join(dir, "spool.jsonl");
  const cache = readJsonFile(n, cacheFile, { entries: {}, failModes: {}, defaults: {} });
  const summary = summarizeInput(call.input);
  const hash = (s) => n.crypto.createHash("sha256").update(s).digest("hex").slice(0, 32);
  const user = process.env.TRUEHOUND_USER || config.user || call.user || `${n.os.userInfo().username}@${n.os.hostname()}`;
  const host = n.os.hostname();
  const spool = (rec) => {
    try {
      n.fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      n.fs.appendFileSync(spoolFile, `${JSON.stringify(rec)}\n`, { mode: 0o600 });
    } catch {
      /* the record is lost, the call is not blocked */
    }
  };
  const base = { client, server: call.server, tool: call.tool, input: summary.text, redactions: summary.redactions, user, host, session: call.session };
  const nowMs = Date.now();
  const hit = cachedAllow(cache, [cacheKey(client, call, "tool", summary.text, hash), cacheKey(client, call, "input", summary.text, hash)], nowMs);
  if (hit) {
    spool({ ...base, at: new Date().toISOString(), decision: "allow", source: "cache", reason: hit.reason || "cached allow", policyId: hit.policyId ?? null, clientMs: Math.round((performance.now() - started) * 10) / 10 });
    return emit(formatDecision(client, "allow", ""));
  }
  // Records kept while offline or answered from the cache go with this request.
  let pending = [];
  let sending;
  try {
    sending = `${spoolFile}.${process.pid}.sending`;
    n.fs.renameSync(spoolFile, sending);
    pending = n.fs.readFileSync(sending, "utf8").split("\n").filter(Boolean).slice(-200).map((l) => JSON.parse(l));
  } catch {
    sending = null;
  }
  const timeoutMs = Math.min(MAX_TIMEOUT_MS, Math.max(50, Number(process.env.TRUEHOUND_TIMEOUT_MS) || config.timeoutMs || DEFAULT_TIMEOUT_MS));
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  let answer = null;
  const t0 = performance.now();
  try {
    const res = await fetch(`${String(config.api).replace(/\/+$/, "")}/api/hooks/v1/decide`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${config.token}`, "user-agent": `truehound-hook/${VERSION} (${client})` },
      body: JSON.stringify({ ...base, version: VERSION, pending }),
      signal: ac.signal,
    });
    if (res.ok) answer = await res.json();
  } catch {
    answer = null;
  } finally {
    clearTimeout(timer);
  }
  const rtt = Math.round((performance.now() - t0) * 10) / 10;
  if (sending) {
    try {
      if (answer) n.fs.unlinkSync(sending);
      else {
        n.fs.appendFileSync(spoolFile, n.fs.readFileSync(sending, "utf8"), { mode: 0o600 });
        n.fs.unlinkSync(sending);
      }
    } catch {
      /* best effort */
    }
  }
  if (!answer || !["allow", "deny", "ask"].includes(answer.decision)) {
    const mode = failModeFor(cache, call);
    const decision = mode === "closed" ? "deny" : "allow";
    spool({ ...base, at: new Date().toISOString(), decision, source: mode === "closed" ? "fail-closed" : "fail-open", reason: `Truehound did not answer within ${timeoutMs} ms`, clientMs: rtt });
    return emit(formatDecision(client, decision, decision === "deny" ? `could not reach Truehound in ${timeoutMs} ms and this policy fails closed` : ""));
  }
  // Remember what the server said for next time: fail modes always, allows for their TTL.
  try {
    // Policies changed since these allows were cached: forget them all.
    if (answer.configVersion && answer.configVersion !== cache.configVersion) cache.entries = {};
    cache.configVersion = answer.configVersion ?? cache.configVersion;
    cache.entries = Object.fromEntries(Object.entries(cache.entries ?? {}).filter(([, e]) => e.until > nowMs).slice(-500));
    cache.failModes = { ...(cache.failModes ?? {}), [`${call.server}|${call.tool}`]: answer.failMode === "closed" ? "closed" : "open" };
    if (answer.defaults) cache.defaults = { failMode: answer.defaults.failMode === "closed" ? "closed" : "open" };
    const ttl = Number(answer.cache?.ttl) || 0;
    if (answer.decision === "allow" && ttl > 0 && answer.cache?.scope !== "none")
      cache.entries[cacheKey(client, call, answer.cache.scope, summary.text, hash)] = { decision: "allow", until: nowMs + ttl * 1000, policyId: answer.policyId ?? null, reason: answer.reason };
    writeJsonFile(n, cacheFile, cache);
  } catch {
    /* no cache this time */
  }
  if (answer.eventId) spool({ kind: "rtt", id: answer.eventId, clientMs: rtt });
  return emit(formatDecision(client, answer.decision, answer.reason));
}

// ── Install ─────────────────────────────────────────────────────────────

/** The hook command a client config runs. */
export function hookCommand(scriptPath, client) {
  return `node "${scriptPath}" --client ${client}`;
}

/** Where each client keeps its user config, and the managed (MDM) one. */
export function clientConfigPath(client, { homeDir, platform = process.platform, managed = false }) {
  const mac = platform === "darwin";
  const win = platform === "win32";
  if (managed) {
    if (client === "claude-code") return mac ? "/Library/Application Support/ClaudeCode/managed-settings.json" : win ? "C:\\Program Files\\ClaudeCode\\managed-settings.json" : "/etc/claude-code/managed-settings.json";
    if (client === "cursor") return mac ? "/Library/Application Support/Cursor/hooks.json" : win ? "C:\\ProgramData\\Cursor\\hooks.json" : "/etc/cursor/hooks.json";
    if (client === "windsurf") return mac ? "/Library/Application Support/Devin/hooks.json" : win ? "C:\\ProgramData\\Devin\\hooks.json" : "/etc/devin/hooks.json";
    return null;
  }
  const j = (...p) => [homeDir, ...p].join(win ? "\\" : "/");
  if (client === "claude-code") return j(".claude", "settings.json");
  if (client === "cursor") return j(".cursor", "hooks.json");
  if (client === "windsurf") return j(".codeium", "windsurf", "hooks.json");
  if (client === "copilot") return j(".copilot", "hooks", "truehound.json");
  if (client === "codex") return j(".codex", "hooks.json");
  return null;
}

const MARKER = "truehound-hook.mjs";

/**
 * Add (or update) the Truehound hook in a client config object, keeping
 * everything else in it. Returns the new object.
 */
export function mergeClientConfig(client, existing, command, { allTools = false } = {}) {
  const cfg = existing && typeof existing === "object" ? structuredClone(existing) : {};
  cfg.hooks = cfg.hooks && typeof cfg.hooks === "object" ? cfg.hooks : {};
  const strip = (list) => (Array.isArray(list) ? list : []).filter((h) => !JSON.stringify(h).includes(MARKER));
  if (client === "claude-code" || client === "codex") {
    // Claude Code: timeout in seconds (the script gives up on the network after 250 ms itself).
    cfg.hooks.PreToolUse = [...strip(cfg.hooks.PreToolUse), { matcher: allTools ? "*" : "mcp__.*", hooks: [{ type: "command", command, timeout: 5 }] }];
  } else if (client === "cursor") {
    cfg.version = cfg.version ?? 1;
    cfg.hooks.beforeMCPExecution = [...strip(cfg.hooks.beforeMCPExecution), { command, timeout: 5 }];
    const shell = strip(cfg.hooks.beforeShellExecution);
    if (allTools) cfg.hooks.beforeShellExecution = [...shell, { command, timeout: 5 }];
    else if (shell.length) cfg.hooks.beforeShellExecution = shell;
    else delete cfg.hooks.beforeShellExecution;
  } else if (client === "windsurf") {
    cfg.hooks.pre_mcp_tool_use = [...strip(cfg.hooks.pre_mcp_tool_use), { command, show_output: false }];
  } else if (client === "copilot") {
    cfg.version = cfg.version ?? 1;
    cfg.hooks.preToolUse = [...strip(cfg.hooks.preToolUse), { type: "command", command, timeoutSec: 5 }];
  }
  return cfg;
}

/** Remove the Truehound hook from a client config object. */
export function unmergeClientConfig(existing) {
  const cfg = existing && typeof existing === "object" ? structuredClone(existing) : {};
  for (const [k, list] of Object.entries(cfg.hooks ?? {})) {
    if (!Array.isArray(list)) continue;
    cfg.hooks[k] = list.filter((h) => !JSON.stringify(h).includes(MARKER));
    if (!cfg.hooks[k].length) delete cfg.hooks[k];
  }
  return cfg;
}

async function ask(question) {
  const rl = (await import("node:readline")).createInterface({ input: process.stdin, output: process.stderr, terminal: true });
  return new Promise((resolve) => rl.question(question, (a) => (rl.close(), resolve(a.trim()))));
}

async function install(argv) {
  const n = await node();
  const client = argValue(argv, "--client") ?? "claude-code";
  if (!CLIENTS.includes(client)) throw new Error(`--client must be one of ${CLIENTS.join(", ")}`);
  const dir = home(n);
  const prior = readJsonFile(n, n.path.join(dir, "hook.json"), {});
  const api = argValue(argv, "--api") || process.env.TRUEHOUND_API || prior.api;
  if (!api || !/^https?:\/\//.test(api)) throw new Error("Pass --api https://your-truehound-api (shown in Truehound next to the token).");
  let token = process.env.TRUEHOUND_HOOK_TOKEN || prior.token;
  if (!token) token = await ask("Paste the workspace hook token (th_hook_...): ");
  if (!/^th_hook_[A-Za-z0-9_-]{20,}$/.test(token ?? "")) throw new Error("That is not a Truehound hook token.");
  let user = argValue(argv, "--user") || process.env.TRUEHOUND_USER || prior.user;
  if (!user) {
    try {
      const { execFileSync } = await import("node:child_process");
      user = execFileSync("git", ["config", "--global", "user.email"], { encoding: "utf8", timeout: 2000 }).trim() || undefined;
    } catch {
      user = undefined;
    }
  }
  writeJsonFile(n, n.path.join(dir, "hook.json"), { api, token, ...(user ? { user } : {}) });
  const script = n.path.join(dir, "truehound-hook.mjs");
  const self = new URL(import.meta.url).pathname;
  if (n.path.resolve(self) !== n.path.resolve(script)) n.fs.copyFileSync(self, script);
  const file = clientConfigPath(client, { homeDir: n.os.homedir() });
  const next = mergeClientConfig(client, readJsonFile(n, file, {}), hookCommand(script, client), { allTools: argv.includes("--all-tools") });
  writeJsonFile(n, file, next, 0o644);
  process.stderr.write(`Truehound hook installed for ${client}: ${file}\nToken kept in ${n.path.join(dir, "hook.json")} (only you can read it).\n`);
}

async function uninstall(argv) {
  const n = await node();
  const client = argValue(argv, "--client") ?? "claude-code";
  const file = clientConfigPath(client, { homeDir: n.os.homedir() });
  writeJsonFile(n, file, unmergeClientConfig(readJsonFile(n, file, {})), 0o644);
  process.stderr.write(`Truehound hook removed from ${file}\n`);
}

async function printConfig(argv) {
  const client = argValue(argv, "--client") ?? "claude-code";
  const managed = argv.includes("--managed");
  const script = argValue(argv, "--script") ?? (process.platform === "darwin" ? "/Library/Application Support/Truehound/truehound-hook.mjs" : "/opt/truehound/truehound-hook.mjs");
  const target = clientConfigPath(client, { homeDir: "~", managed });
  process.stdout.write(`${JSON.stringify(mergeClientConfig(client, {}, hookCommand(script, client), { allTools: argv.includes("--all-tools") }), null, 2)}\n`);
  process.stderr.write(`Deploy to: ${target ?? "the client's user config"}. Put { "api": ..., "token": ... } in ${managed ? "the Truehound managed hook.json" : "~/.truehound/hook.json"} with mode 600.\n`);
}

export async function main(argv) {
  const cmd = argv[0];
  try {
    if (cmd === "install") return await install(argv);
    if (cmd === "uninstall") return await uninstall(argv);
    if (cmd === "print-config") return await printConfig(argv);
    if (cmd === "--version") return void process.stdout.write(`${VERSION}\n`);
    return await runHook(argv);
  } catch (err) {
    process.stderr.write(`truehound-hook: ${err?.message ?? err}\n`);
    // A broken install never blocks a tool call.
    process.exitCode = cmd === "install" || cmd === "uninstall" || cmd === "print-config" ? 1 : 0;
  }
}

if (typeof process !== "undefined" && process.argv?.[1] && /truehound-hook\.mjs$/.test(process.argv[1]) && !globalThis.navigator?.userAgent?.includes("Cloudflare")) {
  void main(process.argv.slice(2));
}
