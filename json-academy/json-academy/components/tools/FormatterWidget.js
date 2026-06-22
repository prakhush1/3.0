"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

/* ─── helpers ─────────────────────────────────────────── */

const SAMPLE = `{"name":"JSON Academy","tools":9,"private":true,"tags":["json","tools","free"],"meta":{"version":2,"active":true}}`;

function parseJSON(raw) {
  if (!raw.trim()) return { parsed: null, error: "", errorLine: null, errorCol: null };
  try {
    const parsed = JSON.parse(raw);
    return { parsed, error: "", errorLine: null, errorCol: null };
  } catch (e) {
    let errorLine = null;
    let errorCol = null;

    const posMatch = e.message.match(/at position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = raw.slice(0, pos);
      const lines = before.split("\n");
      errorLine = lines.length;
      errorCol = lines[lines.length - 1].length + 1;
    }

    const lineColMatch = e.message.match(/line (\d+) column (\d+)/);
    if (lineColMatch) {
      errorLine = parseInt(lineColMatch[1], 10);
      errorCol = parseInt(lineColMatch[2], 10);
    }

    let friendly = e.message
      .replace(/JSON\.parse: /, "")
      .replace(/in JSON at position \d+/, "")
      .trim();
    if (/trailing comma/i.test(friendly))
      friendly = "Trailing comma — remove the last comma before ] or }";
    if (/unexpected token '?}'?/i.test(friendly))
      friendly = "Unexpected } — check for a missing comma or extra closing brace";
    if (/unexpected token '?]'?/i.test(friendly))
      friendly = "Unexpected ] — check for a missing comma or extra closing bracket";
    if (/unexpected end/i.test(friendly))
      friendly = "Unexpected end of input — a bracket or brace may not be closed";
    if (/expected property name/i.test(friendly) || /unexpected token '?,'?/i.test(friendly))
      friendly = "Expected a property name — check for a trailing comma or missing key";

    return { parsed: null, error: friendly, errorLine, errorCol };
  }
}

function toLines(raw) {
  return raw.split("\n").map((text, i) => ({ n: i + 1, text }));
}

/* ─── sub-components ──────────────────────────────────── */

function ToolbarBtn({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10 active:scale-95"
    >
      {children}
    </button>
  );
}

function IndentPills({ indent, setIndent }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-400">Indent:</span>
      {[2, 4, "tab"].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setIndent(v)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            indent === v
              ? "bg-violet-500 text-white"
              : "border border-white/10 text-gray-400 hover:bg-white/10"
          }`}
        >
          {v === "tab" ? "Tab" : `${v} spaces`}
        </button>
      ))}
    </div>
  );
}

function AnnotatedEditor({ value, onChange, errorLine, readOnly = false, placeholder }) {
  const scrollRef = useRef(null);
  const taRef = useRef(null);

  const syncScroll = useCallback(() => {
    if (scrollRef.current && taRef.current) {
      scrollRef.current.scrollTop = taRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    if (!errorLine || !taRef.current) return;
    const lineHeight = 20;
    taRef.current.scrollTop = Math.max(0, (errorLine - 1) * lineHeight - 60);
    syncScroll();
  }, [errorLine, syncScroll]);

  const lines = toLines(value || "");

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-lg border border-white/8 bg-[#0d1117] font-mono text-[13px]">
      {/* gutter + error-line highlight layer */}
      <div
        ref={scrollRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ paddingTop: 12, paddingBottom: 12 }}
      >
        {lines.map(({ n }) => {
          const isErr = n === errorLine;
          return (
            <div key={n} className="relative flex" style={{ lineHeight: "20px" }}>
              <span
                className={`select-none pr-3 text-right text-[11px] ${
                  isErr ? "text-red-400" : "text-gray-600"
                }`}
                style={{ minWidth: 36, paddingLeft: 8 }}
              >
                {n}
              </span>
              {isErr && (
                <span className="absolute inset-0 border-l-2 border-red-500 bg-red-500/10" />
              )}
            </div>
          );
        })}
      </div>

      {/* transparent textarea on top */}
      <textarea
        ref={taRef}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none bg-transparent py-3 pr-4 text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset focus:ring-violet-500"
        style={{ paddingLeft: 44, lineHeight: "20px" }}
      />
    </div>
  );
}

function StatusDot({ error, empty }) {
  if (empty) return null;
  const ok = !error;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
      <span className={`text-xs font-semibold ${ok ? "text-emerald-400" : "text-red-400"}`}>
        {ok ? "Valid JSON" : "Invalid JSON"}
      </span>
    </div>
  );
}

/* ─── main widget ─────────────────────────────────────── */

export default function FormatterWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const { parsed, error, errorLine, errorCol } = useMemo(() => parseJSON(input), [input]);

  const output = useMemo(() => {
    if (!parsed) return "";
    const space = indent === "tab" ? "\t" : indent;
    return JSON.stringify(parsed, null, space);
  }, [parsed, indent]);

  const isEmpty = !input.trim();

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  /* Lock body scroll — this widget IS the page */
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0d1117]">

      {/* ── top bar ── */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">

        {/* left — logo + nav links */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500 text-white">
              <Icon name="code" className="w-3.5 h-3.5" />
            </span>
            <span className="hidden text-sm font-bold text-white sm:block">
              <span className="text-violet-400">&#123;JSON&#125;</span> Academy
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/8 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="rounded-md px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/8 hover:text-white"
            >
              Tools
            </Link>
            <span className="ml-1 text-xs text-gray-600">/</span>
            <span className="ml-1 text-xs font-semibold text-violet-400">JSON Formatter</span>
          </nav>
        </div>

        {/* center — indent + status (hidden on small screens) */}
        <div className="hidden items-center gap-4 md:flex">
          <StatusDot error={error} empty={isEmpty} />
          <div className="h-4 w-px bg-white/10" />
          <IndentPills indent={indent} setIndent={setIndent} />
        </div>

        {/* right — copy + download */}
        <div className="flex items-center gap-2">
          {output && (
            <>
              <ToolbarBtn onClick={handleCopy}>
                <Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </ToolbarBtn>
              <ToolbarBtn onClick={handleDownload}>
                <Icon name="download" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">.json</span>
              </ToolbarBtn>
            </>
          )}
        </div>
      </div>

      {/* ── mobile — status + indent row ── */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-white/10 px-4 md:hidden">
        <StatusDot error={error} empty={isEmpty} />
        <div className="h-4 w-px bg-white/10" />
        <IndentPills indent={indent} setIndent={setIndent} />
      </div>

      {/* ── two-panel editor ── */}
      <div className="flex min-h-0 flex-1 divide-x divide-white/10">

        {/* input panel */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">Input JSON</span>
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-xs text-gray-500 transition hover:text-gray-300"
              >
                Clear
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 p-3">
            <AnnotatedEditor
              value={input}
              onChange={(e) => setInput(e.target.value)}
              errorLine={errorLine}
            />
          </div>

          {/* inline error banner — pinned to bottom of input panel */}
          {error && (
            <div className="shrink-0 border-t border-red-900/50 bg-red-950/40 px-4 py-2.5">
              <div className="flex items-start gap-2">
                <Icon name="zap" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                <p className="text-xs leading-relaxed text-red-400">
                  {errorLine && (
                    <span className="mr-1.5 font-semibold text-red-300">
                      Line {errorLine}{errorCol ? `, col ${errorCol}` : ""}:
                    </span>
                  )}
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* output panel */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">Formatted output</span>
            {!output && error && (
              <span className="text-xs text-gray-600">Fix errors to see output</span>
            )}
          </div>

          <div className="min-h-0 flex-1 p-3">
            <AnnotatedEditor
              value={output}
              readOnly
              errorLine={null}
              placeholder="Output appears once JSON is valid…"
            />
          </div>

          {/* stats footer */}
          <div className="shrink-0 border-t border-white/10 px-4 py-2">
            <p className="text-xs text-gray-600">
              {output
                ? `${output.split("\n").length} lines · ${new Blob([output]).size.toLocaleString()} bytes · processed locally`
                : "Paste or type JSON in the input panel"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
