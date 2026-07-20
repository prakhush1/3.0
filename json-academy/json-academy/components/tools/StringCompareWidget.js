"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
import FormatterToolPanel from "@/components/tools/FormatterToolPanel";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE_A = `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!`;
const SAMPLE_B = `The quick brown fox jumps over the lazy cat.
Pack my box with five dozen juice jugs.
How vexingly quick daft zebras jump.`;

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

/* ─── diff algorithm ─────────────────────────────────── */

/**
 * Word-level LCS diff. Returns an array of segments:
 *   { type: "equal" | "added" | "removed", text: string }
 * Compares word-by-word (whitespace tokens are preserved so spacing is faithful).
 */
function diffWords(a, b) {
  const tokenize = (s) => s.match(/\s+|[^\s]+/g) || [];
  const A = tokenize(a);
  const B = tokenize(b);
  const m = A.length, n = B.length;
  // LCS dp table
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  // Walk forward, collapsing consecutive same-type segments
  const segs = [];
  let i = 0, j = 0;
  const push = (type, text) => {
    if (!text) return;
    const last = segs[segs.length - 1];
    if (last && last.type === type) last.text += text;
    else segs.push({ type, text });
  };
  while (i < m && j < n) {
    if (A[i] === B[j]) { push("equal", A[i]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { push("removed", A[i]); i++; }
    else { push("added", B[j]); j++; }
  }
  while (i < m) push("removed", A[i++]);
  while (j < n) push("added", B[j++]);
  return segs;
}

/* ─── theme-aware diff palette ───────────────────────── */
function buildDiffPalette(theme) {
  const isLight = theme.wrapperBg && parseInt(theme.wrapperBg.replace("#",""), 16) > 0x888888;
  if (isLight) {
    return {
      added:   { fg: "#166534", bg: "#dcfce7", decoration: "#86efac" },
      removed: { fg: "#991b1b", bg: "#fee2e2", decoration: "#fca5a5" },
      addedRowBg:   "rgba(34,197,94,0.10)",
      removedRowBg: "rgba(239,68,68,0.10)",
    };
  }
  return {
    added:   { fg: "#34d399", bg: "rgba(16,185,129,0.22)", decoration: "rgba(16,185,129,0.5)" },
    removed: { fg: "#f87171", bg: "rgba(239,68,68,0.22)", decoration: "rgba(239,68,68,0.5)" },
    addedRowBg:   "rgba(16,185,129,0.04)",
    removedRowBg: "rgba(239,68,68,0.04)",
  };
}

function ToolbarBtn({ onClick, children, theme }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95"
      style={{ border: `1px solid ${theme.btnBorder}`, color: theme.btnFg, backgroundColor: theme.shell }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.shell; }}>
      {children}
    </button>
  );
}

/* ─── main ───────────────────────────────────────────── */

export default function StringCompareWidget() {
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);
  const [view, setView] = useState("inline"); // "inline" | "side"
  const { theme: et, setTheme } = useEditorTheme();

  const segments = useMemo(() => diffWords(a, b), [a, b]);
  const palette = useMemo(() => buildDiffPalette(et), [et]);

  const counts = useMemo(() => {
    let added = 0, removed = 0, equal = 0;
    for (const s of segments) {
      if (s.type === "added") added += s.text.length;
      else if (s.type === "removed") removed += s.text.length;
      else equal += s.text.length;
    }
    return { added, removed, equal };
  }, [segments]);

  const handleSwap = useCallback(() => {
    setA(b);
    setB(a);
  }, [a, b]);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  const isIdentical = counts.added === 0 && counts.removed === 0;

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ backgroundColor: et.wrapperBg }}>
      <FormatterToolPanel theme={et} activeSlug="string-compare" />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar theme={et} title="String Compare" right={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-md p-0.5" style={{ border: `1px solid ${et.btnBorder}` }}>
              {[
                { v: "inline", label: "Inline" },
                { v: "side", label: "Side by side" },
              ].map(({ v, label }) => {
                const isActive = view === v;
                return (
                  <button key={v} type="button" onClick={() => setView(v)}
                    className="rounded px-2.5 py-1 text-[11px] font-semibold transition"
                    style={{
                      backgroundColor: isActive ? et.accent : "transparent",
                      color: isActive ? et.accentFg : et.btnFg,
                    }}>{label}</button>
                );
              })}
            </div>
            <ToolbarBtn theme={et} onClick={handleSwap}>
              <Icon name="repeat" className="w-3.5 h-3.5" />Swap
            </ToolbarBtn>
            {!isIdentical && (
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: et.labelFg }}>
                <span className="flex items-center gap-1" style={{ color: palette.added.fg }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.added.fg }} />+{counts.added}
                </span>
                <span className="flex items-center gap-1" style={{ color: palette.removed.fg }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.removed.fg }} />−{counts.removed}
                </span>
              </div>
            )}
            {isIdentical && a.trim() && b.trim() && (
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: palette.added.fg }}>
                <Icon name="check-circle" className="h-3.5 w-3.5" />Identical
              </span>
            )}
          </div>
        } />

        <div className="flex h-[42%] shrink-0" style={{ borderTop: `1px solid ${et.shellBorder}`, borderBottom: `1px solid ${et.shellBorder}` }}>
          {[{ label: "Text A", val: a, set: setA }, { label: "Text B", val: b, set: setB }].map(({ label, val, set }, i) => (
            <div key={label} className="flex min-w-0 flex-1 flex-col" style={{ borderRight: i === 0 ? `1px solid ${et.shellBorder}` : undefined }}>
              <div className="flex h-9 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
                <span className="text-xs font-semibold" style={{ color: et.labelFg }}>{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono" style={{ color: et.gutterFg }}>{val.length.toLocaleString()} chars · {val.split("\n").length} line{val.split("\n").length > 1 ? "s" : ""}</span>
                  {val && <button type="button" onClick={() => set("")} className="text-xs transition" style={{ color: et.gutterFg }}
                    onMouseEnter={e => { e.currentTarget.style.color = et.labelFg; }}
                    onMouseLeave={e => { e.currentTarget.style.color = et.gutterFg; }}>Clear</button>}
                </div>
              </div>
              <div className="min-h-0 flex-1 p-3">
                <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
                  <textarea value={val} onChange={(e) => set(e.target.value)} spellCheck={false} placeholder={`Paste ${label.toLowerCase()} here…`} className={ta}
                    style={{ lineHeight: "20px", color: et.editorFg, "--tw-ring-color": et.accent }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center px-4" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
            <span className="text-xs font-semibold" style={{ color: et.labelFg }}>
              {view === "inline" ? "Inline diff" : "Side-by-side diff"}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">
            {!a.trim() || !b.trim() ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm italic" style={{ color: et.gutterFg }}>Paste text in both panels above to compare</p>
              </div>
            ) : isIdentical ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Icon name="check-circle" className="h-4 w-4" />
                  <span className="text-sm font-semibold">Both strings are identical</span>
                </div>
              </div>
            ) : view === "inline" ? (
              <InlineDiff segments={segments} palette={palette} et={et} />
            ) : (
              <SideBySideDiff segments={segments} palette={palette} et={et} />
            )}
          </div>
          <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
            <p className="text-xs" style={{ color: et.footerFg }}>
              Word-level LCS diff · processed locally
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── inline diff renderer ──────────────────────────── */

function InlineDiff({ segments, palette, et }) {
  return (
    <pre className="whitespace-pre-wrap break-words rounded-lg p-4 font-mono text-[13px] leading-[20px]"
      style={{ backgroundColor: et.shell, border: `1px solid ${et.shellBorder}`, color: et.editorFg }}>
      {segments.map((s, i) => {
        if (s.type === "equal") return <span key={i}>{s.text}</span>;
        if (s.type === "added") {
          return <span key={i} style={{ backgroundColor: palette.added.bg, color: palette.added.fg, textDecoration: "underline", textDecorationColor: palette.added.decoration }}>{s.text}</span>;
        }
        return <span key={i} style={{ backgroundColor: palette.removed.bg, color: palette.removed.fg, textDecoration: "line-through", textDecorationColor: palette.removed.decoration }}>{s.text}</span>;
      })}
    </pre>
  );
}

/* ─── side-by-side diff renderer ────────────────────── */

function SideBySideDiff({ segments, palette, et }) {
  // Build aligned rows: equal rows align both sides; added shows on right (left blank); removed shows on left (right blank).
  const rows = [];
  let bufA = [], bufB = [];
  const flush = () => {
    if (bufA.length || bufB.length) {
      rows.push({ left: bufA.join(""), right: bufB.join("") });
      bufA = []; bufB = [];
    }
  };
  for (const s of segments) {
    if (s.type === "equal") {
      // split on newline boundaries so equal text aligns line by line
      const parts = s.text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) { bufA.push(parts[i]); bufB.push(parts[i]); }
        if (i < parts.length - 1) flush();
      }
    } else if (s.type === "added") {
      // Try to keep added segments adjacent to neighbouring equal text in the same visual block
      bufB.push(s.text);
    } else {
      bufA.push(s.text);
    }
  }
  flush();

  return (
    <div className="grid grid-cols-2 gap-0 rounded-lg overflow-hidden"
      style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
      {rows.map((row, ri) => (
        <div key={ri} className="contents">
          <SideCell text={row.left} palette={palette} et={et} side="left" />
          <SideCell text={row.right} palette={palette} et={et} side="right" />
        </div>
      ))}
    </div>
  );
}

function SideCell({ text, palette, et, side }) {
  const removedBg = palette.removedRowBg ?? palette.removed.bg;
  const addedBg = palette.addedRowBg ?? palette.added.bg;
  const rowBg = !text ? (side === "left" ? removedBg : addedBg) : "transparent";
  const isHighlighted = !!text;
  const fillColor = isHighlighted ? (side === "left" ? palette.removed.bg : palette.added.bg) : "transparent";
  const fgColor = isHighlighted ? (side === "left" ? palette.removed.fg : palette.added.fg) : et.editorFg;

  return (
    <div className="px-4 py-1 font-mono text-[13px] leading-[20px] whitespace-pre-wrap break-words"
      style={{
        color: fgColor,
        borderTop: `1px solid ${et.shellBorder}`,
        backgroundColor: rowBg,
        borderRight: side === "left" ? `1px solid ${et.shellBorder}` : undefined,
      }}>
      {!text && <span style={{ color: et.gutterFg }}>·</span>}
      <span style={{ backgroundColor: fillColor }}>{text}</span>
    </div>
  );
}
