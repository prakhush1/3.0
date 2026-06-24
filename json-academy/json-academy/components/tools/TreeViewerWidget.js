"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import FormatterToolPanel from "@/components/tools/FormatterToolPanel";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE = `{
  "platform": "JSON Tools",
  "tools": 9,
  "active": true,
  "owner": null,
  "tags": ["json", "free", "private"],
  "meta": { "version": "2.0", "open": false }
}`;

/* ─── helpers ─────────────────────────────────────────── */
function valueColor(v, theme) {
  if (typeof v === "string") return theme.accent;
  if (typeof v === "number") return theme.accent;
  if (typeof v === "boolean" || v === null) return theme.accent;
  return theme.editorFg;
}
function fmt(v) { if (v === null) return "null"; if (typeof v === "string") return `"${v}"`; return String(v); }

function TreeNode({ k, value, depth, expandAll, theme }) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = value !== null && typeof value === "object";
  const expanded = expandAll === null ? open : expandAll;

  if (!isObj) return (
    <div className="py-px pl-4" style={{ marginLeft: depth * 16 }}>
      {k !== undefined && <span style={{ color: theme.gutterFg }}>"{k}": </span>}
      <span style={{ color: valueColor(value, theme) }}>{fmt(value)}</span>
    </div>
  );

  const isArr = Array.isArray(value);
  const entries = isArr ? value.map((v, i) => [i, v]) : Object.entries(value);

  return (
    <div className="py-px" style={{ marginLeft: depth * 16 }}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 pl-1 text-left transition"
        style={{ color: theme.editorFg }}
        onMouseEnter={e => { e.currentTarget.style.color = theme.accent; }}
        onMouseLeave={e => { e.currentTarget.style.color = theme.editorFg; }}>
        <Icon name="arrow-right" className={`w-3 h-3 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
        {k !== undefined && <span style={{ color: theme.gutterFg }}>"{k}": </span>}
        <span style={{ color: theme.gutterFg }}>{isArr ? `[ ${entries.length} ]` : `{ ${entries.length} }`}</span>
      </button>
      {expanded && (
        <div>
          {entries.map(([ck, cv]) => <TreeNode key={ck} k={ck} value={cv} depth={depth + 1} expandAll={expandAll} theme={theme} />)}
        </div>
      )}
    </div>
  );
}

/* ─── main ───────────────────────────────────────────── */
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

function PanelBtn({ onClick, children, theme }) {
  return (
    <button type="button" onClick={onClick} className="rounded-md px-3 py-1.5 text-xs font-semibold transition"
      style={{ border: `1px solid ${theme.btnBorder}`, color: theme.btnFg }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
      {children}
    </button>
  );
}

export default function TreeViewerWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [expandAll, setExpandAll] = useState(null);
  const { theme: et } = useEditorTheme();

  const { data, error } = useMemo(() => {
    if (!input.trim()) return { data: null, error: "" };
    try { return { data: JSON.parse(input), error: "" }; }
    catch (e) { return { data: null, error: e.message }; }
  }, [input]);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ backgroundColor: et.wrapperBg }}>
      <FormatterToolPanel theme={et} activeSlug="json-tree-viewer" />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar theme={et} title="JSON Tree Viewer" right={
          data && (
            <div className="flex items-center gap-2">
              <PanelBtn theme={et} onClick={() => setExpandAll(true)}>Expand all</PanelBtn>
              <PanelBtn theme={et} onClick={() => setExpandAll(false)}>Collapse all</PanelBtn>
            </div>
          )
        } />

        <div className="flex min-h-0 flex-1" style={{ borderTop: `1px solid ${et.shellBorder}` }}>
          <div className="flex min-h-0 flex-1 flex-col" style={{ borderRight: `1px solid ${et.shellBorder}` }}>
            <div className="flex h-9 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
              <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Input JSON</span>
              {input && <button type="button" onClick={() => setInput("")} className="text-xs transition" style={{ color: et.gutterFg }}>Clear</button>}
            </div>
            <div className="min-h-0 flex-1 p-3">
              <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className={ta}
                  style={{ lineHeight: "20px", color: et.editorFg, "--tw-ring-color": et.accent }} />
              </div>
            </div>
            {error && (
              <div className="shrink-0 px-4 py-2.5" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
                <div className="flex items-start gap-2">
                  <Icon name="zap" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <p className="text-xs leading-relaxed text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-center px-4" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
              <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Interactive tree</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              {data ? (
                <div className="font-mono text-[13px]" style={{ lineHeight: "22px", color: et.editorFg }}>
                  <TreeNode value={data} depth={0} expandAll={expandAll} theme={et} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-xs" style={{ color: et.gutterFg }}>{error ? "Fix errors to see the tree" : "Paste JSON in the input panel"}</p>
                </div>
              )}
            </div>
            <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
              <p className="text-xs" style={{ color: et.footerFg }}>{data ? "Click any node to expand or collapse · processed locally" : "Paste or type JSON in the input panel"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
