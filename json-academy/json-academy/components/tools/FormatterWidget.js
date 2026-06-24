"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { EDITOR_THEMES, DEFAULT_EDITOR_THEME_ID, EDITOR_THEME_STORAGE_KEY } from "@/lib/themes";
import FormatterToolPanel from "@/components/tools/FormatterToolPanel";

/* ─── helpers ─────────────────────────────────────────── */

const SAMPLE = `{"name":"JSON Academy","tools":9,"private":true,"tags":["json","tools","free"],"meta":{"version":2,"active":true}}`;

let _uid = 0;
function uid() { return ++_uid; }
function makeWindow(n) { return { id: uid(), label: `Window ${n}`, input: SAMPLE, indent: 2 }; }

function parseJSON(raw) {
  if (!raw.trim()) return { parsed: null, error: "", errorLine: null, errorCol: null };
  try {
    return { parsed: JSON.parse(raw), error: "", errorLine: null, errorCol: null };
  } catch (e) {
    let errorLine = null, errorCol = null;
    const pm = e.message.match(/at position (\d+)/);
    if (pm) {
      const before = raw.slice(0, parseInt(pm[1], 10));
      const lines = before.split("\n");
      errorLine = lines.length;
      errorCol = lines[lines.length - 1].length + 1;
    }
    const lc = e.message.match(/line (\d+) column (\d+)/);
    if (lc) { errorLine = parseInt(lc[1], 10); errorCol = parseInt(lc[2], 10); }
    let msg = e.message.replace(/JSON\.parse: /, "").replace(/in JSON at position \d+/, "").trim();
    if (/trailing comma/i.test(msg)) msg = "Trailing comma — remove the last comma before ] or }";
    if (/unexpected token '?}'?/i.test(msg)) msg = "Unexpected } — check for a missing comma or extra closing brace";
    if (/unexpected token '?]'?/i.test(msg)) msg = "Unexpected ] — check for a missing comma or extra closing bracket";
    if (/unexpected end/i.test(msg)) msg = "Unexpected end of input — a bracket or brace may not be closed";
    if (/expected property name/i.test(msg) || /unexpected token '?,'?/i.test(msg)) msg = "Expected a property name — check for a trailing comma or missing key";
    return { parsed: null, error: msg, errorLine, errorCol };
  }
}

function toLines(raw) { return raw.split("\n").map((text, i) => ({ n: i + 1, text })); }

function findMatches(text, query) {
  if (!query || !text) return [];
  const matches = [], lower = text.toLowerCase(), q = query.toLowerCase();
  let idx = 0;
  while (idx < lower.length) {
    const found = lower.indexOf(q, idx);
    if (found === -1) break;
    const before = text.slice(0, found);
    const lineNum = before.split("\n").length;
    const lastNL = before.lastIndexOf("\n");
    const startCol = found - (lastNL + 1);
    matches.push({ charIdx: found, line: lineNum, startCol, endCol: startCol + q.length });
    idx = found + q.length;
  }
  return matches;
}

/* ─── EditorThemePicker ───────────────────────────────── */

function EditorThemePicker({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} title="Editor theme"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition"
        style={{ border: `1px solid ${theme.btnBorder}`, color: theme.btnFg }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
        <span className="h-3 w-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: theme.accent }} />
        <span className="hidden sm:inline">{theme.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl p-1.5 shadow-2xl"
          style={{ backgroundColor: theme.shell, border: `1px solid ${theme.shellBorder}` }}>
          <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.labelFg }}>Editor Colour</p>
          {EDITOR_THEMES.map(t => {
            const isActive = t.id === theme.id;
            return (
              <button key={t.id} onClick={() => { setTheme(t); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition"
                style={{ backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent", color: isActive ? "#ffffff" : theme.labelFg }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
                <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/10" style={{ backgroundColor: t.accent }} />
                <span className="flex-1">{t.label}</span>
                {isActive && (
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── ToolbarBtn ──────────────────────────────────────── */

function ToolbarBtn({ onClick, children, theme, title, accent }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95"
      style={accent
        ? { backgroundColor: theme.accent, color: theme.accentFg }
        : { border: `1px solid ${theme.btnBorder}`, color: theme.btnFg }}
      onMouseEnter={e => { if (!accent) e.currentTarget.style.backgroundColor = theme.btnHover; }}
      onMouseLeave={e => { if (!accent) e.currentTarget.style.backgroundColor = "transparent"; }}>
      {children}
    </button>
  );
}

/* ─── IndentPills ─────────────────────────────────────── */

function IndentPills({ indent, setIndent, theme }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>Indent:</span>
      {[2, 4, "tab"].map(v => {
        const isActive = indent === v;
        return (
          <button key={v} type="button" onClick={() => setIndent(v)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold transition"
            style={isActive ? { backgroundColor: theme.accent, color: theme.accentFg } : { border: `1px solid ${theme.btnBorder}`, color: theme.labelFg }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = theme.btnHover; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
            {v === "tab" ? "Tab" : `${v}sp`}
          </button>
        );
      })}
    </div>
  );
}

/* ─── StatusDot ───────────────────────────────────────── */

function StatusDot({ error, empty }) {
  if (empty) return null;
  const ok = !error;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
      <span className={`text-xs font-semibold ${ok ? "text-emerald-400" : "text-red-400"}`}>
        {ok ? "Valid" : "Invalid"}
      </span>
    </div>
  );
}

/* ─── AnnotatedEditor ─────────────────────────────────── */

function AnnotatedEditor({ value, onChange, errorLine, readOnly = false, placeholder, theme }) {
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const isMultiline = (value || "").includes("\n");
  const lineText = (value || "").split("\n").map((t) => `  ${t}`).join("\n").slice(2);
  const displayValue = isMultiline ? value : lineText;
  const syncScroll = useCallback(() => {
      if (scrollRef.current && taRef.current) {
        scrollRef.current.scrollTop = taRef.current.scrollTop;
      }
    }, []);
  useEffect(() => {
    if (!errorLine || !taRef.current) return;
    taRef.current.scrollTop = Math.max(0, (errorLine - 1) * 20 - 60);
    syncScroll();
  }, [errorLine, syncScroll]);
  const lines = toLines(value || "");
  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-lg font-mono text-[13px]"
      style={{ backgroundColor: theme.panelBg, border: `1px solid ${theme.panelBorder}` }}>
      <div ref={scrollRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ paddingTop: 12, paddingBottom: 12 }}>
        {lines.map(({ n }) => {
          const isErr = n === errorLine;
          return (
            <div key={n} className="relative flex" style={{ lineHeight: "20px" }}>
              <span className="select-none pr-3 text-right text-[11px]"
                style={{ minWidth: 36, paddingLeft: 8, color: isErr ? "#f87171" : theme.gutterFg }}>{n}</span>
              {isErr && <span className="absolute inset-0 border-l-2 border-red-500 bg-red-500/10" />}
            </div>
          );
        })}
      </div>
      <textarea ref={taRef} readOnly={readOnly} value={displayValue} onChange={(e) => {
          const raw = e.target.value;
          onChange(isMultiline ? raw : raw.replace(/^  /, ""));
        }}
        onScroll={syncScroll} placeholder={placeholder} spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none bg-transparent py-3 pr-4 outline-none"
              style={{ paddingLeft: 44, lineHeight: "20px", color: theme.editorFg, caretColor: theme.accent, whiteSpace: "pre-wrap", overflowWrap: "break-word", overflowX: "hidden", overflowY: "auto" }} />
    </div>
  );
}

/* ─── HighlightedOutput ───────────────────────────────── */

function HighlightedOutput({ value, matches, activeMatchIdx, theme }) {
  const containerRef = useRef(null);
  const activeMarkRef = useRef(null);
  useEffect(() => {
    if (activeMarkRef.current) activeMarkRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeMatchIdx, matches]);
  const lines = useMemo(() => toLines(value || ""), [value]);
  const matchesByLine = useMemo(() => {
    const map = {};
    matches.forEach((m, i) => { if (!map[m.line]) map[m.line] = []; map[m.line].push({ ...m, globalIdx: i }); });
    return map;
  }, [matches]);
  return (
    <div ref={containerRef} className="h-full overflow-auto rounded-lg font-mono text-[13px]"
      style={{ backgroundColor: theme.panelBg, border: `1px solid ${theme.panelBorder}`, lineHeight: "20px", paddingTop: 12, paddingBottom: 12 }}>
      {lines.map(({ n, text }) => {
        const lm = matchesByLine[n] || [];
        let segs = [], cur = 0;
        for (const m of lm) {
          if (m.startCol > cur) segs.push({ type: "text", content: text.slice(cur, m.startCol) });
          segs.push({ type: "mark", content: text.slice(m.startCol, m.endCol), isActive: m.globalIdx === activeMatchIdx, globalIdx: m.globalIdx });
          cur = m.endCol;
        }
        if (cur < text.length) segs.push({ type: "text", content: text.slice(cur) });
        if (segs.length === 0) segs.push({ type: "text", content: text });
        return (
          <div key={n} className="flex" style={{ lineHeight: "20px" }}>
            <span className="select-none pr-3 text-right text-[11px] shrink-0"
              style={{ minWidth: 36, paddingLeft: 8, color: theme.gutterFg }}>{n}</span>
            <span className="pr-4 whitespace-pre" style={{ color: theme.editorFg }}>
              {segs.map((seg, si) =>
                seg.type === "text" ? <span key={si}>{seg.content}</span> : (
                  <mark key={si} ref={seg.isActive ? activeMarkRef : null}
                    style={{ backgroundColor: seg.isActive ? "#f59e0b" : "rgba(250,204,21,0.35)", color: seg.isActive ? "#000" : "inherit", borderRadius: 2, outline: seg.isActive ? "2px solid #f59e0b" : "none" }}>
                    {seg.content}
                  </mark>
                )
              )}
            </span>
          </div>
        );
      })}
      {!value && <p className="px-11 text-xs italic" style={{ color: theme.gutterFg }}>Output appears once JSON is valid…</p>}
    </div>
  );
}

/* ─── FormatterPane — one window's content ────────────── */

function FormatterPane({ win, onChange, et }) {
  const { input, indent } = win;
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  const { parsed, error, errorLine, errorCol } = useMemo(() => parseJSON(input), [input]);
  const output = useMemo(() => {
    if (!parsed) return "";
    return JSON.stringify(parsed, null, indent === "tab" ? "\t" : indent);
  }, [parsed, indent]);

  const matches = useMemo(() => findMatches(output, searchQuery), [output, searchQuery]);
  useEffect(() => { setActiveMatchIdx(0); }, [matches.length, searchQuery]);

  const isEmpty = !input.trim();
  const clearSearch = useCallback(() => { setSearchQuery(""); setActiveMatchIdx(0); }, []);
  const goNext = useCallback(() => { if (matches.length) setActiveMatchIdx(i => (i + 1) % matches.length); }, [matches.length]);
  const goPrev = useCallback(() => { if (matches.length) setActiveMatchIdx(i => (i - 1 + matches.length) % matches.length); }, [matches.length]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }, [output]);
  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "formatted.json"; a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Input */}
      <div className="flex min-h-0 flex-col overflow-hidden" style={{ width: "50%", borderRight: `1px solid ${et.divider}` }}>
        <div className="flex h-9 shrink-0 items-center justify-between px-3"
          style={{ borderBottom: `1px solid ${et.divider}` }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Input JSON</span>
            <StatusDot error={error} empty={isEmpty} />
          </div>
          <div className="flex items-center gap-2">
            <IndentPills indent={indent} setIndent={v => onChange({ indent: v })} theme={et} />
            {input && (
              <button type="button" onClick={() => onChange({ input: "" })}
                className="text-xs transition" style={{ color: et.gutterFg }}
                onMouseEnter={e => { e.currentTarget.style.color = et.labelFg; }}
                onMouseLeave={e => { e.currentTarget.style.color = et.gutterFg; }}>
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 p-3">
          <AnnotatedEditor value={input} onChange={e => onChange({ input: e.target.value })} errorLine={errorLine} theme={et} />
        </div>
        {error && (
          <div className="shrink-0 px-4 py-2.5"
            style={{ borderTop: "1px solid rgba(239,68,68,0.3)", backgroundColor: "rgba(220,38,38,0.10)" }}>
            <div className="flex items-start gap-2">
              <Icon name="zap" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <p className="text-xs leading-relaxed text-red-400">
                {errorLine && <span className="mr-1.5 font-semibold text-red-300">Line {errorLine}{errorCol ? `, col ${errorCol}` : ""}:</span>}
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="flex min-h-0 flex-col overflow-hidden" style={{ width: "50%" }}>
        <div className="flex h-9 shrink-0 items-center justify-between px-3"
          style={{ borderBottom: `1px solid ${et.divider}` }}>
          <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Formatted output</span>
          <div className="flex items-center gap-2">
            {output && (
              <>
                <ToolbarBtn onClick={handleCopy} theme={et}>
                  <Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </ToolbarBtn>
                <ToolbarBtn onClick={handleDownload} theme={et}>
                  <Icon name="download" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </ToolbarBtn>
              </>
            )}
          </div>
        </div>
        {/* ── Inline search bar — always visible when output exists ── */}
        {output && (
          <div className="flex shrink-0 items-center gap-2 px-3 py-1.5"
            style={{ borderBottom: `1px solid ${et.divider}`, backgroundColor: et.panelBg }}>
            {/* Search icon */}
            <svg className="w-3.5 h-3.5 shrink-0 transition-colors"
              style={{ color: searchQuery ? et.accent : et.gutterFg }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            {/* Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { e.shiftKey ? goPrev() : goNext(); }
                if (e.key === "Escape") clearSearch();
              }}
              placeholder="Search output…"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              style={{ color: et.editorFg }}
            />
            {/* Match counter */}
            {searchQuery && (
              <span className="shrink-0 text-[11px] tabular-nums font-medium px-1.5 py-0.5 rounded"
                style={{
                  color: matches.length === 0 ? "#f87171" : et.accent,
                  backgroundColor: matches.length === 0 ? "rgba(248,113,113,0.12)" : `${et.accent}18`,
                }}>
                {matches.length === 0 ? "No results" : `${activeMatchIdx + 1} / ${matches.length}`}
              </span>
            )}
            {/* Prev / Next — only shown when there are multiple matches */}
            {matches.length > 1 && (
              <>
                <button onClick={goPrev} title="Previous match (Shift+Enter)"
                  className="flex h-5 w-5 items-center justify-center rounded transition"
                  style={{ color: et.labelFg }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = et.btnHover; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button onClick={goNext} title="Next match (Enter)"
                  className="flex h-5 w-5 items-center justify-center rounded transition"
                  style={{ color: et.labelFg }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = et.btnHover; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </>
            )}
            {/* Clear × — only when there's a query */}
            {searchQuery && (
              <button onClick={clearSearch} title="Clear search (Esc)"
                className="flex h-5 w-5 items-center justify-center rounded transition"
                style={{ color: et.gutterFg }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = et.btnHover; e.currentTarget.style.color = et.labelFg; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = et.gutterFg; }}>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1 p-3">
          <HighlightedOutput value={output} matches={matches} activeMatchIdx={activeMatchIdx} theme={et} />
        </div>
        <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
          <p className="text-xs" style={{ color: et.footerFg }}>
            {output
              ? `${output.split("\n").length} lines · ${new Blob([output]).size.toLocaleString()} bytes · processed locally`
              : "Paste or type JSON in the input panel"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── WindowTabBar ────────────────────────────────────── */

function WindowTabBar({ windows, activeId, onSelect, onClose, onAdd, onRename, et }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const editRef = useRef(null);
  const scrollRef = useRef(null);

  const startRename = (w, e) => {
    e.stopPropagation();
    setEditingId(w.id); setEditVal(w.label);
    setTimeout(() => editRef.current?.select(), 30);
  };
  const commitRename = () => {
    if (editVal.trim()) onRename(editingId, editVal.trim());
    setEditingId(null);
  };

  // Scroll newly added tab into view
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [windows.length]);

  return (
    <div className="shrink-0 flex flex-col" style={{ backgroundColor: et.shell }}>

      {/* ── Tab row ── */}
      <div className="flex items-stretch" style={{ borderBottom: `1px solid ${et.shellBorder}` }}>

        {/* Scrollable tabs */}
        <div ref={scrollRef} className="flex items-stretch flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {windows.map((w) => {
            const isActive = w.id === activeId;
            return (
              <div key={w.id}
                className="group relative flex shrink-0 items-stretch cursor-pointer select-none"
                style={{
                  minWidth: 110,
                  maxWidth: 180,
                  borderRight: `1px solid ${et.shellBorder}`,
                  backgroundColor: isActive ? et.wrapperBg : "transparent",
                }}>
                {/* Active top accent line */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-b" style={{ backgroundColor: et.accent }} />
                )}

                <button onClick={() => onSelect(w.id)} onDoubleClick={e => startRename(w, e)}
                  title="Double-click to rename"
                  className="flex flex-1 items-center gap-2 pl-3 pr-1 py-2 text-xs font-medium transition min-w-0"
                  style={{ color: isActive ? et.editorFg : et.labelFg }}>
                  {/* Dot */}
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full transition"
                    style={{ backgroundColor: isActive ? et.accent : et.gutterFg, opacity: isActive ? 1 : 0.45 }} />
                  {/* Label / inline rename */}
                  {editingId === w.id ? (
                    <input ref={editRef} value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingId(null); }}
                      className="flex-1 min-w-0 bg-transparent outline-none text-xs"
                      style={{ color: et.editorFg, borderBottom: `1px solid ${et.accent}` }}
                      onClick={e => e.stopPropagation()} />
                  ) : (
                    <span className="flex-1 min-w-0 truncate text-left">{w.label}</span>
                  )}
                </button>

                {/* Close × */}
                {windows.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); onClose(w.id); }}
                    title="Close this window"
                    className="flex h-full w-6 shrink-0 items-center justify-center rounded transition opacity-0 group-hover:opacity-100"
                    style={{ color: et.gutterFg, ...(isActive ? { opacity: 0.5 } : {}) }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,80,80,0.15)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = et.gutterFg; }}>
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── + Add new window button ── */}
        <button onClick={onAdd} title="Open a new formatter window (Ctrl+T)"
          className="flex shrink-0 items-center gap-2 px-4 text-xs font-semibold transition"
          style={{
            color: et.labelFg,
            borderLeft: `1px solid ${et.shellBorder}`,
            minWidth: 42,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = `${et.accent}22`;
            e.currentTarget.style.color = et.accent;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = et.labelFg;
          }}>
          {/* Big + icon */}
          <span className="flex h-5 w-5 items-center justify-center rounded"
            style={{ border: `1.5px dashed currentColor`, opacity: 0.7 }}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="hidden md:inline whitespace-nowrap">New Window</span>
        </button>
      </div>

      {/* ── Info strip (shows hint when multiple windows open) ── */}
      {windows.length > 1 && (
        <div className="flex items-center gap-2 px-4 py-1.5"
          style={{ backgroundColor: `${et.accent}10`, borderBottom: `1px solid ${et.accent}25` }}>
          <svg className="w-3 h-3 shrink-0" style={{ color: et.accent }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: et.accent }}>
            {windows.length} windows open — click a tab to switch · double-click a tab to rename
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Widget ─────────────────────────────────────── */

export default function FormatterWidget() {
  const [windows, setWindows] = useState(() => [makeWindow(1)]);
  const [activeId, setActiveId] = useState(() => windows[0].id);

  const [editorTheme, setEditorThemeState] = useState(
    () => EDITOR_THEMES.find(t => t.id === DEFAULT_EDITOR_THEME_ID) ?? EDITOR_THEMES[0]
  );
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EDITOR_THEME_STORAGE_KEY);
      if (saved) { const f = EDITOR_THEMES.find(t => t.id === saved); if (f) setEditorThemeState(f); }
    } catch {}
  }, []);
  const setEditorTheme = useCallback(t => {
    setEditorThemeState(t);
    try { localStorage.setItem(EDITOR_THEME_STORAGE_KEY, t.id); } catch {}
  }, []);

  const et = editorTheme;

  // Ctrl+T shortcut to add window
  useEffect(() => {
    function h(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "t") { e.preventDefault(); addWindow(); }
    }
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const addWindow = useCallback(() => {
    setWindows(ws => {
      const n = makeWindow(ws.length + 1);
      setTimeout(() => setActiveId(n.id), 0);
      return [...ws, n];
    });
  }, []);

  const closeWindow = useCallback(id => {
    setWindows(ws => {
      const idx = ws.findIndex(w => w.id === id);
      const next = ws.filter(w => w.id !== id);
      if (activeId === id && next.length > 0) setActiveId(next[Math.max(0, idx - 1)].id);
      return next;
    });
  }, [activeId]);

  const renameWindow = useCallback((id, label) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, label } : w));
  }, []);

  const updateWindow = useCallback((id, patch) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, ...patch } : w));
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, []);

  const activeWin = windows.find(w => w.id === activeId) ?? windows[0];

  return (
    <div className="fixed inset-0 flex overflow-hidden transition-colors" style={{ backgroundColor: et.wrapperBg }}>

        {/* ── Left tool navigation panel (theme-aware, collapsible) ── */}
        <FormatterToolPanel theme={et} activeSlug="json-formatter" />

        {/* ── Main column ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* ── Top bar ── */}
          <div className="flex h-12 shrink-0 items-center justify-between px-4"
            style={{ backgroundColor: et.shell, borderBottom: `1px solid ${et.shellBorder}` }}>
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: et.accent, color: et.accentFg }}>
                  <Icon name="code" className="w-3.5 h-3.5" />
                </span>
                <span className="hidden text-sm font-bold sm:block" style={{ color: et.editorFg }}>
                  <span style={{ color: et.accent }}>&#123;JSON&#125;</span> Academy
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                <Link href="/" className="rounded-md px-3 py-1.5 text-xs transition" style={{ color: et.labelFg }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = et.btnHover; e.currentTarget.style.color = et.editorFg; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = et.labelFg; }}>Home</Link>
                <Link href="/tools" className="rounded-md px-3 py-1.5 text-xs transition" style={{ color: et.labelFg }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = et.btnHover; e.currentTarget.style.color = et.editorFg; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = et.labelFg; }}>Tools</Link>
                <span className="ml-1 text-xs" style={{ color: et.gutterFg }}>/</span>
                <span className="ml-1 text-xs font-semibold" style={{ color: et.accent }}>JSON Formatter</span>
              </nav>
            </div>
            <EditorThemePicker theme={et} setTheme={setEditorTheme} />
          </div>

          {/* ── Window tab bar + [ + New Window ] button ── */}
          <WindowTabBar
            windows={windows}
            activeId={activeId}
            onSelect={setActiveId}
            onClose={closeWindow}
            onAdd={addWindow}
            onRename={renameWindow}
            et={et}
          />

          {/* ── Active formatter pane ── */}
          {activeWin && (
            <FormatterPane
              key={activeWin.id}
              win={activeWin}
              onChange={patch => updateWindow(activeWin.id, patch)}
              et={et}
            />
          )}
        </div>
      </div>
    );
  }

/* Mark this widget as full-bleed so the page layout skips its normal chrome */
FormatterWidget.fullBleed = true;
