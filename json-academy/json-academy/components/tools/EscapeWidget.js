"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
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

export default function EscapeWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const { theme: et, setTheme } = useEditorTheme();

  const output = useMemo(() => input ? JSON.stringify(input).slice(1, -1) : "", [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }, [output]);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <ToolShell title="JSON Escape" activeSlug="json-escape" theme={et} setTheme={setTheme} right={output && <ToolbarBtn theme={et} onClick={handleCopy}><Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}</ToolbarBtn>}>
      <div className="grid min-h-[640px] grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border" style={{ backgroundColor: et.panelBg, borderColor: et.panelBorder }}>
          <div className="flex h-11 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: et.labelFg }}>Raw text</span>
            {input && <button type="button" onClick={() => setInput("")} className="text-xs transition" style={{ color: et.gutterFg }}>Clear</button>}
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.panelBorder}`, backgroundColor: et.shell }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="Paste raw text to escape…" className={ta}
                style={{ lineHeight: "20px", color: et.editorFg, "--tw-ring-color": et.accent }} />
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border" style={{ backgroundColor: et.panelBg, borderColor: et.panelBorder }}>
          <div className="flex h-11 shrink-0 items-center px-4" style={{ borderBottom: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: et.labelFg }}>Escaped output</span>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.panelBorder}`, backgroundColor: et.shell }}>
              <textarea readOnly value={output} spellCheck={false} placeholder="Escaped text appears here…" className={ta}
                style={{ lineHeight: "20px", color: et.editorFg, "--tw-ring-color": et.accent }} />
            </div>
          </div>
          <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
            <p className="text-xs" style={{ color: et.footerFg }}>{output ? `${output.length.toLocaleString()} chars · processed locally` : "Paste text in the input panel"}</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
