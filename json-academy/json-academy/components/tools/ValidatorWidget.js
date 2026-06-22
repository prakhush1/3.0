"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

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

function AnnotatedEditor({ value, onChange, errorLine }) {
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
    <div className="relative h-full min-h-0 overflow-hidden rounded-lg border border-white/8 bg-[#0d1117] font-mono text-[13px]">
      <div ref={scrollRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ paddingTop: 12, paddingBottom: 12 }}>
        {lines.map(({ n }) => {
          const isErr = n === errorLine;
          return (
            <div key={n} className="relative flex" style={{ lineHeight: "20px" }}>
              <span className={`select-none pr-3 text-right text-[11px] ${isErr ? "text-red-400" : "text-gray-600"}`} style={{ minWidth: 36, paddingLeft: 8 }}>{n}</span>
              {isErr && <span className="absolute inset-0 border-l-2 border-red-500 bg-red-500/10" />}
            </div>
          );
        })}
      </div>
      <textarea ref={taRef} value={value} onChange={onChange} onScroll={syncScroll} spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none bg-transparent py-3 pr-4 text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset focus:ring-violet-500"
        style={{ paddingLeft: 44, lineHeight: "20px" }} />
    </div>
  );
}

function TopBar({ title, right }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500 text-white">
            <Icon name="code" className="w-3.5 h-3.5" />
          </span>
          <span className="hidden text-sm font-bold text-white sm:block"><span className="text-violet-400">&#123;JSON&#125;</span> Academy</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/" className="rounded-md px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/8 hover:text-white">Home</Link>
          <Link href="/tools" className="rounded-md px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/8 hover:text-white">Tools</Link>
          <span className="ml-1 text-xs text-gray-600">/</span>
          <span className="ml-1 text-xs font-semibold text-violet-400">{title}</span>
        </nav>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

export default function ValidatorWidget() {
  const [input, setInput] = useState(SAMPLE);
  const { valid, error, errorLine, errorCol } = useMemo(() => parseJSON(input), [input]);
  const isEmpty = !input.trim();

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0d1117]">
      <TopBar title="JSON Validator" right={
        !isEmpty && (
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${valid ? "bg-emerald-400" : "bg-red-400"}`} />
            <span className={`text-xs font-semibold ${valid ? "text-emerald-400" : "text-red-400"}`}>
              {valid ? "Valid JSON" : "Invalid JSON"}
            </span>
          </div>
        )
      } />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <span className="text-xs font-semibold text-gray-400">Paste JSON to validate</span>
          {input && <button type="button" onClick={() => setInput("")} className="text-xs text-gray-500 hover:text-gray-300 transition">Clear</button>}
        </div>
        <div className="min-h-0 flex-1 p-3">
          <AnnotatedEditor value={input} onChange={(e) => setInput(e.target.value)} errorLine={errorLine} />
        </div>

        {!isEmpty && (
          <div className={`shrink-0 border-t px-4 py-3 ${valid ? "border-emerald-900/50 bg-emerald-950/40" : "border-red-900/50 bg-red-950/40"}`}>
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
    </div>
  );
}
