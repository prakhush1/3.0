"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzA1MzEwOTAwLCJleHAiOjE5OTk5OTk5OTksImlzcyI6Impzb24tYWNhZGVteSIsImF1ZCI6WyJ3ZWIiLCJtb2JpbGUiXSwicm9sZSI6ImFkbWluIn0.dQw4w9WgXcQ";

/* ─── Base64URL helpers ───────────────────────────────── */

function base64UrlDecode(str) {
  if (!str) return "";
  let s = String(str).replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    const binary = atob(s);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return "";
  }
}

function base64UrlToBytes(str) {
  let s = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    const binary = atob(s);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/* ─── Signature verification ──────────────────────────── */

async function verifyHs256(headerB64, payloadB64, signatureB64, secret) {
  if (!secret) return { ok: false, reason: "no-secret" };
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = enc.encode(`${headerB64}.${payloadB64}`);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const expected = new Uint8Array(sig);
  const got = base64UrlToBytes(signatureB64);
  if (!got || got.length !== expected.length) return { ok: false, reason: "mismatch" };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ got[i];
  return { ok: diff === 0, reason: diff === 0 ? "ok" : "mismatch" };
}

async function verifyRs256(headerB64, payloadB64, signatureB64, publicKeyPem) {
  if (!publicKeyPem) return { ok: false, reason: "no-key" };
  try {
    const pem = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/\s+/g, "");
    const binary = atob(pem);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const key = await crypto.subtle.importKey(
      "spki",
      bytes,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sig = base64UrlToBytes(signatureB64);
    if (!sig) return { ok: false, reason: "bad-sig-b64" };
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, sig, data);
    return { ok, reason: ok ? "ok" : "mismatch" };
  } catch (e) {
    return { ok: false, reason: "key-error", detail: e.message };
  }
}

async function verifyToken(headerB64, payloadB64, signatureB64, alg, secretOrKey) {
  if (alg === "HS256") return verifyHs256(headerB64, payloadB64, signatureB64, secretOrKey);
  if (alg === "RS256") return verifyRs256(headerB64, payloadB64, signatureB64, secretOrKey);
  return { ok: null, reason: "unsupported", alg };
}

/* ─── Time helpers ────────────────────────────────────── */

function fmtTime(unixSec) {
  if (!unixSec || !Number.isFinite(unixSec)) return null;
  try {
    const d = new Date(unixSec * 1000);
    return { iso: d.toISOString(), rel: relTime(d) };
  } catch {
    return null;
  }
}

function relTime(d) {
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let v = Math.floor(abs / 1000), label = "second";
  for (const [step, name] of units) {
    if (v < step) { label = name; break; }
    v = Math.floor(v / step);
    label = name;
  }
  v = Math.max(1, v);
  const plural = v === 1 ? label : label + "s";
  return diff < 0 ? `${v} ${plural} ago` : `in ${v} ${plural}`;
}

/* ─── Claim rendering ─────────────────────────────────── */

const CLAIM_META = {
  iss: { label: "Issuer", icon: "shield" },
  sub: { label: "Subject", icon: "mouse" },
  aud: { label: "Audience", icon: "eye" },
  exp: { label: "Expires", icon: "zap" },
  nbf: { label: "Not before", icon: "zap" },
  iat: { label: "Issued at", icon: "zap" },
  jti: { label: "JWT ID", icon: "braces" },
};

function ClaimRow({ keyName, value, theme, nowMs }) {
  const meta = CLAIM_META[keyName];
  const isTime = keyName === "exp" || keyName === "nbf" || keyName === "iat";
  const time = isTime ? fmtTime(Number(value)) : null;
  const ts = time ? new Date(time.iso).getTime() : null;
  const isExpired = keyName === "exp" && ts !== null && ts < nowMs;
  const isNotYet = keyName === "nbf" && ts !== null && ts > nowMs;

  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-3 py-1.5"
      style={{ borderBottom: `1px solid ${theme.divider}` }}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: theme.gutterFg }}>
        {meta?.icon && <Icon name={meta.icon} className="w-3 h-3 shrink-0" />}
        <span>{meta?.label || keyName}</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-mono break-all" style={{ color: theme.editorFg }}>
          <span>{Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : JSON.stringify(value)}</span>
        </div>
        {time && (
          <div className="mt-0.5 flex items-center gap-2 text-[10px]" style={{ color: theme.gutterFg }}>
            <span>{time.iso}</span>
            <span style={{ color: isExpired ? "#f87171" : isNotYet ? "#fbbf24" : theme.accent }}>· {time.rel}</span>
            {isExpired && <span className="font-bold uppercase text-[10px] tracking-wider text-red-400">Expired</span>}
            {isNotYet && <span className="font-bold uppercase text-[10px] tracking-wider text-amber-400">Not yet valid</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Highlight (JSON with line gutter, expandable, indent-aware) ─ */

function tokenizeJson(text) {
  const out = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}\[\],])/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) out.push({ t: m[2] ? "key" : "str", v: m[1] });
    else if (m[3]) out.push({ t: "num", v: m[3] });
    else if (m[4]) out.push({ t: "bool", v: m[4] });
    else if (m[5]) out.push({ t: "null", v: m[5] });
    else if (m[6]) out.push({ t: "punc", v: m[6] });
  }
  return out;
}

function lineWithIndent(line, indentWidth) {
  const m = line.match(/^(\s*)(.*)$/);
  const ws = m ? m[1] : "";
  const rest = m ? m[2] : line;
  const tabs = (ws.match(/\t/g) || []).length;
  const otherWs = ws.replace(/\t/g, "");
  return { indent: " ".repeat(tabs * indentWidth + otherWs.length), rest };
}

function JsonView({ text, theme }) {
  if (!text) return <p className="px-11 text-xs italic" style={{ color: theme.gutterFg }}>Empty</p>;
  const isLight = theme.wrapperBg && parseInt(theme.wrapperBg.replace("#",""), 16) > 0x888888;
  const palette = {
      key:  theme.accent,
      str:  isLight ? "#0f766e" : "#a5d8ff",
      num:  isLight ? "#b45309" : "#fbbf24",
      bool: isLight ? "#c2410c" : "#fb923c",
      null: theme.gutterFg,
      punc: theme.gutterFg,
      text: theme.editorFg,
  };
  const indentWidth = 4;

  const lines = text.split("\n");

  return (
      <pre className="font-mono text-[12.5px] leading-[20px]" style={{ color: palette.text }}>
        {lines.map((line, lineIdx) => {
          const { indent, rest } = lineWithIndent(line, indentWidth);
          const segs = tokenizeJson(rest);
          if (segs.length === 0) segs.push({ t: "text", v: "" });

          return (
            <div key={lineIdx} className="flex" style={{ lineHeight: "20px" }}>
              <span className="select-none pr-3 text-right text-[10px] shrink-0 pt-px"
                style={{ minWidth: 36, paddingLeft: 8, color: theme.gutterFg }}>{lineIdx + 1}</span>
              <span className="pr-4 whitespace-pre" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: theme.gutterFg }}>{indent}</span>
                {segs.map((seg, si) => (
                  <span key={si} style={{ color: palette[seg.t] || palette.text }}>{seg.v}</span>
                ))}
              </span>
            </div>
          );
        })}
      </pre>
  );
}

/* ─── Reusable atoms ──────────────────────────────────── */

function ToolbarBtn({ onClick, children, theme, accent }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95"
      style={accent
        ? { backgroundColor: theme.accent, color: theme.accentFg }
        : { border: `1px solid ${theme.btnBorder}`, color: theme.btnFg, backgroundColor: theme.shell }}
      onMouseEnter={e => { if (!accent) e.currentTarget.style.backgroundColor = theme.btnHover; }}
      onMouseLeave={e => { if (!accent) e.currentTarget.style.backgroundColor = theme.shell; }}>
      {children}
    </button>
  );
}

function SectionHeader({ title, badge, theme }) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between px-3"
      style={{ borderBottom: `1px solid ${theme.divider}` }}>
      <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>{title}</span>
      {badge}
    </div>
  );
}

function AlgBadge({ alg, theme }) {
  if (!alg) return null;
  const color = alg.startsWith("HS") ? "#fbbf24" : alg.startsWith("RS") ? "#a78bfa" : "#60a5fa";
  return (
    <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}22`, color }}>
      {alg}
    </span>
  );
}

/* ─── TopBar ──────────────────────────────────────────── */

function TopBar({ title, right, theme }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-4"
      style={{ backgroundColor: theme.shell, borderBottom: `1px solid ${theme.shellBorder}` }}>
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
            <Icon name="lock" className="w-3.5 h-3.5" />
          </span>
          <span className="hidden text-sm font-bold sm:block" style={{ color: theme.editorFg }}>
            <span style={{ color: theme.accent }}>&#123;JSON&#125;</span> Academy
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/" className="rounded-md px-3 py-1.5 text-xs transition" style={{ color: theme.labelFg }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.btnHover; e.currentTarget.style.color = theme.editorFg; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.labelFg; }}>Home</Link>
          <Link href="/tools" className="rounded-md px-3 py-1.5 text-xs transition" style={{ color: theme.labelFg }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.btnHover; e.currentTarget.style.color = theme.editorFg; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.labelFg; }}>Tools</Link>
          <span className="ml-1 text-xs" style={{ color: theme.gutterFg }}>/</span>
          <span className="ml-1 text-xs font-semibold" style={{ color: theme.accent }}>{title}</span>
        </nav>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

/* ─── Main Widget ─────────────────────────────────────── */

export default function JwtDecoderWidget() {
  const [token, setToken] = useState(SAMPLE);
  const [secret, setSecret] = useState("");
  const [verifyMode, setVerifyMode] = useState("off");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState("");
  const { theme: et, setTheme } = useEditorTheme();

  const parsed = useMemo(() => {
    const trimmed = (token || "").trim();
    if (!trimmed) return { error: "", parts: null, headerText: "", payloadText: "", alg: null };
    const parts = trimmed.split(".");
    if (parts.length !== 3) return { error: `Invalid JWT — expected 3 dot-separated parts, found ${parts.length}.`, parts: null, headerText: "", payloadText: "", alg: null };
    const [headerB64, payloadB64, signatureB64] = parts;
    const headerRaw = base64UrlDecode(headerB64);
    const payloadRaw = base64UrlDecode(payloadB64);
    let header = null, payload = null;
    try { header = headerRaw ? JSON.parse(headerRaw) : null; } catch { /* */ }
    try { payload = payloadRaw ? JSON.parse(payloadRaw) : null; } catch { /* */ }
    if (!header || typeof header !== "object") return { error: "Header is not valid JSON.", parts: { headerB64, payloadB64, signatureB64 }, headerText: "", payloadText: "", alg: null };
    if (!payload || typeof payload !== "object") return { error: "Payload is not valid JSON.", parts: { headerB64, payloadB64, signatureB64 }, headerText: headerRaw, payloadText: "", alg: header.alg || null };
    return {
      error: "",
      parts: { headerB64, payloadB64, signatureB64 },
      headerText: JSON.stringify(header, null, "\t"),
            payloadText: JSON.stringify(payload, null, "\t"),
      header, payload,
      alg: header.alg || null,
    };
  }, [token]);

  const expStatus = useMemo(() => {
    if (!parsed.payload || !parsed.payload.exp) return null;
    const exp = Number(parsed.payload.exp);
    if (!Number.isFinite(exp)) return null;
    return new Date(exp * 1000).getTime() < Date.now() ? "expired" : "valid";
  }, [parsed.payload]);

    const nowMs = useMemo(() => Date.now(), [parsed.payload, verifyResult]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setVerifyResult(null); }, [token, secret, verifyMode]);

  const runVerify = useCallback(async () => {
    if (!parsed.parts) return;
    setVerifying(true);
    const { headerB64, payloadB64, signatureB64 } = parsed.parts;
    const result = await verifyToken(headerB64, payloadB64, signatureB64, parsed.alg, secret);
    setVerifyResult(result);
    setVerifying(false);
  }, [parsed.parts, parsed.alg, secret]);

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1200); } catch {}
  };

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  const sigBytes = parsed.parts ? (parsed.parts.signatureB64.length * 3 / 4 | 0) : 0;

  return (
    <ToolShell title="JWT Decoder" activeSlug="jwt-decoder" theme={et} setTheme={setTheme} right={
      <>
        {parsed.alg && <AlgBadge alg={parsed.alg} theme={et} />}
        {expStatus && (
          <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: expStatus === "expired" ? "rgba(248,113,113,0.18)" : `${et.accent}22`,
                     color: expStatus === "expired" ? "#f87171" : et.accent }}>
            <span className={`h-1.5 w-1.5 rounded-full ${expStatus === "expired" ? "bg-red-400" : ""}`}
              style={{ backgroundColor: expStatus === "expired" ? undefined : et.accent }} />
            {expStatus === "expired" ? "Expired" : "Active"}
          </span>
        )}
      </>
    }>
      <div className="flex min-h-[760px] flex-col overflow-hidden rounded-[24px] border" style={{ borderColor: et.panelBorder, backgroundColor: et.panelBg }}>
        <div className="flex min-h-0 flex-1" style={{ borderTop: `1px solid ${et.shellBorder}` }}>
          {/* ── Left: token input ── */}
          <div className="flex min-h-0 flex-col" style={{ width: "42%", borderRight: `1px solid ${et.shellBorder}` }}>
            <SectionHeader theme={et} title="Encoded JWT"
              badge={<span className="text-[10px] font-mono" style={{ color: et.gutterFg }}>header.payload.signature</span>} />

            <div className="min-h-0 flex-1 p-3">
              <div className="relative h-full overflow-hidden rounded-lg"
                style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
                <textarea value={token} onChange={e => setToken(e.target.value)} spellCheck={false} placeholder="Paste a JWT…"
                  className="absolute inset-0 h-full w-full resize-none bg-transparent p-3 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset font-mono text-[12.5px]"
                  style={{ color: et.editorFg, caretColor: et.accent, lineHeight: "20px", whiteSpace: "pre-wrap", wordBreak: "break-all", "--tw-ring-color": et.accent }} />
              </div>
            </div>

            {/* Signature (read-only) */}
            {parsed.parts && (
              <div className="shrink-0 px-3 pb-3">
                <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: et.gutterFg }}>Signature</p>
                <button onClick={() => copy(parsed.parts.signatureB64, "sig")}
                  className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-mono text-[11px] transition"
                  style={{ backgroundColor: et.shell, border: `1px solid ${et.shellBorder}`, color: et.gutterFg }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = et.btnHover; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = et.shell; }}>
                  <span className="truncate flex-1">{parsed.parts.signatureB64 || "(empty)"}</span>
                  <span className="shrink-0" style={{ color: et.gutterFg }}>
                    {copied === "sig" ? <Icon name="check-circle" className="w-3.5 h-3.5 text-emerald-400" /> : <Icon name="copy" className="w-3.5 h-3.5" />}
                  </span>
                </button>
                <p className="mt-1 px-1 text-[10px]" style={{ color: et.gutterFg }}>~{sigBytes} bytes · {parsed.parts.signatureB64.length} base64url chars</p>
              </div>
            )}

            {/* Verification */}
            {parsed.parts && (
              <div className="shrink-0 px-3 pb-3">
                <div className="rounded-lg p-3" style={{ backgroundColor: et.panelBg, border: `1px solid ${et.shellBorder}` }}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: et.gutterFg }}>Verify signature</p>
                    <div className="flex items-center gap-1">
                      {["off", parsed.alg?.startsWith("RS") ? "rs" : "hs"].filter(m => m !== "off" || true).map(m => (
                        <button key={m} onClick={() => setVerifyMode(m)}
                          className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition"
                          style={verifyMode === m
                            ? { backgroundColor: et.accent, color: et.accentFg }
                            : { border: `1px solid ${et.btnBorder}`, color: et.labelFg }}
                          onMouseEnter={e => { if (verifyMode !== m) e.currentTarget.style.backgroundColor = et.btnHover; }}
                          onMouseLeave={e => { if (verifyMode !== m) e.currentTarget.style.backgroundColor = "transparent"; }}>
                          {m === "off" ? "Off" : m === "hs" ? "HMAC" : "RSA"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {verifyMode !== "off" && (
                    <>
                      <textarea value={secret} onChange={e => setSecret(e.target.value)}
                        placeholder={verifyMode === "hs" ? "Shared secret (HS256 key)…" : "-----BEGIN PUBLIC KEY-----\n…"}
                        spellCheck={false}
                        className="block w-full rounded-md bg-transparent px-3 py-2 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset font-mono text-[11px]"
                        style={{ border: `1px solid ${et.shellBorder}`, color: et.editorFg, caretColor: et.accent, minHeight: 60, "--tw-ring-color": et.accent }} />
                      <div className="mt-2 flex items-center gap-2">
                        <ToolbarBtn theme={et} accent onClick={runVerify} disabled={verifying}>
                          <Icon name="shield" className="w-3.5 h-3.5" />{verifying ? "Checking…" : "Verify"}
                        </ToolbarBtn>
                        {verifyResult && verifyResult.ok === true && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <Icon name="check-circle" className="w-3.5 h-3.5" />Valid signature
                          </span>
                        )}
                        {verifyResult && verifyResult.ok === false && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                            <Icon name="zap" className="w-3.5 h-3.5" />
                            {verifyResult.reason === "no-secret" ? "Provide a key to verify" :
                             verifyResult.reason === "no-key" ? "Provide a public key" :
                             verifyResult.reason === "key-error" ? "Invalid public key" : "Signature mismatch"}
                          </span>
                        )}
                        {verifyResult && verifyResult.ok === null && (
                          <span className="text-xs font-semibold" style={{ color: et.gutterFg }}>
                            {verifyResult.reason === "unsupported" ? `${verifyResult.alg} verification not supported` : ""}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: header + payload ── */}
          <div className="flex min-h-0 flex-1 flex-col">
            {parsed.error ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                <Icon name="zap" className="h-8 w-8 text-red-400" />
                <p className="text-sm font-semibold text-red-400">{parsed.error}</p>
                <p className="text-xs" style={{ color: et.gutterFg }}>A JWT must look like <span className="font-mono">xxxxx.yyyyy.zzzzz</span> — three base64url segments.</p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                {/* Header */}
                <div className="flex min-h-0 flex-col" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
                  <SectionHeader theme={et} title="Header" badge={
                    <ToolbarBtn theme={et} onClick={() => copy(parsed.headerText, "hdr")}>
                      <Icon name={copied === "hdr" ? "check-circle" : "copy"} className="w-3.5 h-3.5" />
                      {copied === "hdr" ? "Copied" : "Copy"}
                    </ToolbarBtn>
                  } />
                  <div className="min-h-0 flex-1 overflow-auto">
                    <JsonView text={parsed.headerText} theme={et} />
                  </div>
                </div>
                {/* Payload */}
                <div className="flex min-h-0 flex-1 flex-col">
                  <SectionHeader theme={et} title="Payload" badge={
                    <ToolbarBtn theme={et} onClick={() => copy(parsed.payloadText, "pld")}>
                      <Icon name={copied === "pld" ? "check-circle" : "copy"} className="w-3.5 h-3.5" />
                      {copied === "pld" ? "Copied" : "Copy"}
                    </ToolbarBtn>
                  } />
                  <div className="min-h-0 flex-1 overflow-auto">
                    <JsonView text={parsed.payloadText} theme={et} />
                  </div>
                  {/* Claim guide */}
                  {parsed.payload && (
                    <div className="shrink-0 px-4 py-3" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: et.gutterFg }}>Standard claims</p>
                      <div className="space-y-0">
                        {Object.keys(parsed.payload)
                          .filter(k => CLAIM_META[k])
                                                  .map(k => <ClaimRow key={k} keyName={k} value={parsed.payload[k]} theme={et} nowMs={nowMs} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}

JwtDecoderWidget.fullBleed = true;