"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import FormatterToolPanel from "@/components/tools/FormatterToolPanel";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE = `Hello "World"!\nLine two\ttabbed`;

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

export default function EscapeWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const { theme: et } = useEditorTheme();

  const output = useMemo(() => input ? JSON.stringify(input).slice(1, -1) : "", [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }, [output]);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ backgroundColor: et.wrapperBg }}>
      <FormatterToolPanel theme={et} activeSlug="json-escape" />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar theme={et} title="JSON Escape" right={
          output && <ToolbarBtn theme={et} onClick={handleCopy}><Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}</ToolbarBtn>
        } />

        <div className="flex min-h-0 flex-1" style={{ borderTop: `1px solid ${et.shellBorder}` }}>
          <div className="flex min-h-0 flex-1 flex-col" style={{ borderRight: `1px solid ${et.shellBorder}` }}>
            <div className="flex h-9 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
              <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Raw text</span>
              {input && <button type="button" onClick={() => setInput("")} className="text-xs transition" style={{ color: et.gutterFg }}>Clear</button>}
            </div>
            <div className="min-h-0 flex-1 p-3">
              <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="Paste raw text to escape…" className={ta}
                  style={{ lineHeight: "20px", color: et.editorFg, "--tw-ring-color": et.accent }} />
              </div>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-center px-4" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>
              <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Escaped output</span>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
                <textarea readOnly value={output} spellCheck={false} placeholder="Escaped text appears here…" className={ta}
                  style={{ lineHeight: "20px", color: et.editorFg, "--tw-ring-color": et.accent }} />
              </div>
            </div>
            <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
              <p className="text-xs" style={{ color: et.footerFg }}>{output ? `${output.length.toLocaleString()} chars · processed locally` : "Paste text in the input panel"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
