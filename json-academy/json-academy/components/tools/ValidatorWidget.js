"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE = `{"name":"JSON Academy","tools":9,"private":true,}`;

function parseJSON(raw) {
  if (!raw.trim()) return { valid: null, error: "", errorLine: null, errorCol: null };
  try {
    JSON.parse(raw);
    return { valid: true, error: "", errorLine: null, errorCol: null };
  } catch (e) {
    let errorLine = null, errorCol = null;
    const posMatch = e.message.match(/at position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = raw.slice(0, pos);
      const lines = before.split("\n");
      errorLine = lines.length;
      errorCol = lines[lines.length - 1].length + 1;
    }
    const lcMatch = e.message.match(/line (\d+) column (\d+)/);
    if (lcMatch) { errorLine = parseInt(lcMatch[1], 10); errorCol = parseInt(lcMatch[2], 10); }
    let friendly = e.message.replace(/JSON\.parse: /, "").replace(/in JSON at position \d+/, "").trim();
    if (/trailing comma/i.test(friendly)) friendly = "Trailing comma — remove the last comma before ] or }";
    if (/unexpected token '?}'?/i.test(friendly)) friendly = "Unexpected } — check for a missing comma or extra closing brace";
    if (/unexpected end/i.test(friendly)) friendly = "Unexpected end of input — a bracket or brace may not be closed";
    return { valid: false, error: friendly, errorLine, errorCol };
  }
}

function toLines(raw) { return raw.split("\n").map((text, i) => ({ n: i + 1, text })); }

function AnnotatedEditor({ value, onChange, errorLine, theme }) {
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const syncScroll = useCallback(() => {
    if (scrollRef.current && taRef.current) scrollRef.current.scrollTop = taRef.current.scrollTop;
  }, []);
  useEffect(() => {
    if (!errorLine || !taRef.current) return;
    taRef.current.scrollTop = Math.max(0, (errorLine - 1) * 20 - 60);
    syncScroll();
  }, [errorLine, syncScroll]);
  const lines = toLines(value || "");
  return (
    <div className="relative h-full min-h-[480px] overflow-hidden rounded-lg border font-mono text-[13px]"
      style={{ borderColor: theme.shellBorder, backgroundColor: theme.shell }}>
      <div ref={scrollRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ paddingTop: 12, paddingBottom: 12 }}>
        {lines.map(({ n }) => {
          const isErr = n === errorLine;
          return (
            <div key={n} className="relative flex" style={{ lineHeight: "20px" }}>
              <span className={`select-none pr-3 text-right text-[11px] ${isErr ? "text-red-400" : ""}`} style={{ minWidth: 36, paddingLeft: 8, color: isErr ? undefined : theme.gutterFg }}>{n}</span>
              {isErr && <span className="absolute inset-0 border-l-2 border-red-500 bg-red-500/10" />}
            </div>
          );
        })}
      </div>
      <textarea ref={taRef} value={value} onChange={onChange} onScroll={syncScroll} spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none bg-transparent py-3 pr-4 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset"
        style={{ paddingLeft: 44, lineHeight: "20px", color: theme.editorFg, "--tw-ring-color": theme.accent }} />
    </div>
  );
}

export default function ValidatorWidget() {
  const [input, setInput] = useState(SAMPLE);
  const { theme: et, setTheme } = useEditorTheme();
  const { valid, error, errorLine, errorCol } = useMemo(() => parseJSON(input), [input]);
  const isEmpty = !input.trim();

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <ToolShell title="JSON Validator" activeSlug="json-validator" theme={et} setTheme={setTheme} right={!isEmpty && (
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${valid ? "bg-emerald-400" : "bg-red-400"}`} />
        <span className={`text-xs font-semibold ${valid ? "text-emerald-400" : "text-red-400"}`}>
          {valid ? "Valid JSON" : "Invalid JSON"}
        </span>
      </div>
    )}>
      <div className="flex min-h-[640px] flex-1 flex-col rounded-[24px] border" style={{ backgroundColor: et.panelBg, borderColor: et.panelBorder }}>
        <div className="flex h-11 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.divider}`, color: et.labelFg }}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Paste JSON to validate</span>
          {input && <button type="button" onClick={() => setInput("")} className="text-xs transition" style={{ color: et.gutterFg }}>Clear</button>}
        </div>
        <div className="min-h-0 flex-1 p-3">
          <AnnotatedEditor value={input} onChange={(e) => setInput(e.target.value)} errorLine={errorLine} theme={et} />
        </div>

        {!isEmpty && (
          <div className="shrink-0 px-4 py-3" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
            <div className="flex items-start gap-2">
              <Icon name={valid ? "check-circle" : "zap"} className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${valid ? "text-emerald-400" : "text-red-400"}`} />
              <p className={`text-xs leading-relaxed ${valid ? "text-emerald-400" : "text-red-400"}`}>
                {valid ? "Valid JSON — no syntax errors found." : (
                  <>
                    {errorLine && <span className="mr-1.5 font-semibold text-red-300">Line {errorLine}{errorCol ? `, col ${errorCol}` : ""}:</span>}
                    {error}
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
