"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
import FormatterToolPanel from "@/components/tools/FormatterToolPanel";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE_A = `{"name":"JSON Academy","tools":7,"price":0}`;
const SAMPLE_B = `{"name":"JSON Academy","tools":8,"price":0,"signup":false}`;

/* ─── diff logic ─────────────────────────────────────── */
function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
function diff(a, b, path = "$") {
  const out = [];
  if (isObj(a) && isObj(b)) {
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
      const p = `${path}.${k}`;
      if (!(k in a)) out.push({ type: "added", path: p, value: b[k] });
      else if (!(k in b)) out.push({ type: "removed", path: p, value: a[k] });
      else out.push(...diff(a[k], b[k], p));
    });
  } else if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) out.push({ type: "added", path: p, value: b[i] });
      else if (i >= b.length) out.push({ type: "removed", path: p, value: a[i] });
      else out.push(...diff(a[i], b[i], p));
    }
  } else if (JSON.stringify(a) !== JSON.stringify(b)) {
    out.push({ type: "changed", path, from: a, to: b });
  }
  return out;
}

/* ─── theme-aware diff palette ───────────────────────── */
/** Builds per-type colours that read well on both dark and light themes.
 *  Light themes get solid soft fills with saturated text; dark themes get
 *  translucent fills with bright text (same approach as before but with
 *  theme-driven values so Paper and Arctic don't end up muddy). */
function buildDiffPalette(theme) {
  const wrapperBg = theme?.wrapperBg || "#ffffff";
  const isLight = wrapperBg && parseInt(wrapperBg.replace("#",""), 16) > 0x888888;
  if (isLight) {
    return {
      added:   { bg: "#dcfce7", border: "#86efac", fg: "#166534", dot: "#16a34a" },
      removed: { bg: "#fee2e2", border: "#fca5a5", fg: "#991b1b", dot: "#dc2626" },
      changed: { bg: "#fef3c7", border: "#fcd34d", fg: "#92400e", dot: "#d97706" },
    };
  }
  return {
    added:   { bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.45)", fg: "#34d399", dot: "#34d399" },
    removed: { bg: "rgba(239,68,68,0.18)",  border: "rgba(239,68,68,0.45)",  fg: "#f87171", dot: "#f87171" },
    changed: { bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.45)", fg: "#fbbf24", dot: "#fbbf24" },
  };
}

const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset font-mono text-[13px]";

function TopBar({ title, right, theme }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-4"
      style={{ backgroundColor: theme.shell, borderBottom: `1px solid ${theme.shellBorder}` }}>
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
            <Icon name="code" className="w-3.5 h-3.5" />
          </span>
          <span className="hidden text-sm font-bold sm:block" style={{ color: theme.editorFg }}>
            <span style={{ color: theme.accent }}>JSON</span> Academy
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

/* ─── main ───────────────────────────────────────────── */
export default function DiffCheckerWidget() {
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);
  const { theme: et } = useEditorTheme();
  const theme = et || {
    shell: "#ffffff",
    shellBorder: "#dfe7ee",
    panelBg: "#f9fbfd",
    panelBorder: "#dfe7ee",
    divider: "#dfe7ee",
    gutterFg: "#678099",
    editorFg: "#14202c",
    labelFg: "#678099",
    accent: "#2563eb",
    accentFg: "#ffffff",
    btnBorder: "#dfe7ee",
    btnFg: "#14202c",
    btnHover: "rgba(37,99,235,0.08)",
    footerBg: "#f6f8fb",
    footerFg: "#678099",
    wrapperBg: "#f6f8fb",
  };

  const { changes, error } = useMemo(() => {
    if (!a.trim() || !b.trim()) return { changes: [], error: "" };
    try { return { changes: diff(JSON.parse(a), JSON.parse(b)), error: "" }; }
    catch (e) { return { changes: [], error: e.message }; }
  }, [a, b]);

  const palette = useMemo(() => buildDiffPalette(theme), [theme]);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden" style={{ backgroundColor: theme.wrapperBg }}>
      <div className="flex min-h-0 flex-1 flex-col">
        <TopBar theme={theme} title="JSON Diff Checker" right={
          !error && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>
                {changes.length === 0 ? "No differences" : `${changes.length} difference${changes.length > 1 ? "s" : ""}`}
              </span>
              <div className="flex gap-1.5">
                {["added","removed","changed"].map((t) => {
                  const n = changes.filter((c) => c.type === t).length;
                  if (!n) return null;
                  const p = palette[t];
                  return <span key={t} className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    style={{ borderColor: p.border, backgroundColor: p.bg, color: p.fg }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />{n} {t}
                  </span>;
                })}
              </div>
            </div>
          )
        } />

        <div className="flex h-[45%] shrink-0" style={{ borderTop: `1px solid ${theme.shellBorder}`, borderBottom: `1px solid ${theme.shellBorder}` }}>
          {[{ label: "JSON A — original", val: a, set: setA }, { label: "JSON B — modified", val: b, set: setB }].map(({ label, val, set }, i) => (
            <div key={label} className="flex min-w-0 flex-1 flex-col" style={{ borderRight: i === 0 ? `1px solid ${theme.shellBorder}` : undefined }}>
              <div className="flex h-9 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${theme.shellBorder}` }}>
                <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>{label}</span>
                {val && <button type="button" onClick={() => set("")} className="text-xs transition" style={{ color: theme.gutterFg }}>Clear</button>}
              </div>
              <div className="min-h-0 flex-1 p-3">
                <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${theme.shellBorder}`, backgroundColor: theme.shell }}>
                  <textarea value={val} onChange={(e) => set(e.target.value)} spellCheck={false} className={ta}
                    style={{ lineHeight: "20px", color: theme.editorFg, "--tw-ring-color": theme.accent }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center px-4" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
            <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>Diff results</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border px-3 py-2.5"
                style={{ borderColor: palette.removed.border, backgroundColor: palette.removed.bg }}>
                <Icon name="zap" className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: palette.removed.fg }} />
                <p className="text-xs" style={{ color: palette.removed.fg }}>{error}</p>
              </div>
            )}
            {!error && changes.length === 0 && a.trim() && b.trim() && (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2" style={{ color: palette.added.fg }}>
                  <Icon name="check-circle" className="h-4 w-4" />
                  <span className="text-sm font-semibold">No differences — both JSON documents are identical</span>
                </div>
              </div>
            )}
            {!error && changes.length > 0 && (
              <div className="space-y-1.5">
                {changes.map((c, i) => {
                  const p = palette[c.type];
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-lg border px-3 py-2 font-mono text-xs"
                      style={{ borderColor: p.border, backgroundColor: p.bg, color: p.fg }}>
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: p.dot }} />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold uppercase tracking-wide">{c.type}</span>
                        {" "}<span className="opacity-70">{c.path}</span>
                        {c.type === "changed" && <span className="block mt-0.5 opacity-80">{JSON.stringify(c.from)} → {JSON.stringify(c.to)}</span>}
                        {c.type !== "changed" && <span className="ml-1 opacity-80">= {JSON.stringify(c.value)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${theme.divider}`, backgroundColor: theme.footerBg }}>
            <p className="text-xs" style={{ color: theme.footerFg }}>Comparison is key-order independent · processed locally</p>
          </div>
        </div>
      </div>
      <FormatterToolPanel theme={theme} activeSlug="json-diff-checker" />
    </div>
  );
}
