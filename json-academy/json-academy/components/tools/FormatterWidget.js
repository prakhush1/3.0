"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { EDITOR_THEMES, DEFAULT_EDITOR_THEME_ID, EDITOR_THEME_STORAGE_KEY } from "@/lib/themes";

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
    let friendly = e.message.replace(/JSON\.parse: /, "").replace(/in JSON at position \d+/, "").trim();
    if (/trailing comma/i.test(friendly)) friendly = "Trailing comma — remove the last comma before ] or }";
    if (/unexpected token '?}'?/i.test(friendly)) friendly = "Unexpected } — check for a missing comma or extra closing brace";
    if (/unexpected token '?]'?/i.test(friendly)) friendly = "Unexpected ] — check for a missing comma or extra closing bracket";
    if (/unexpected end/i.test(friendly)) friendly = "Unexpected end of input — a bracket or brace may not be closed";
    if (/expected property name/i.test(friendly) || /unexpected token '?,'?/i.test(friendly)) friendly = "Expected a property name — check for a trailing comma or missing key";
    return { parsed: null, error: friendly, errorLine, errorCol };
  }
}

function toLines(raw) {
  return raw.split("\n").map((text, i) => ({ n: i + 1, text }));
}

/* ─── Search helpers ──────────────────────────────────── */

/**
 * Find all match positions [{line (1-based), startCol, endCol}] for `query` in `text`.
 * Case-insensitive.
 */
function findMatches(text, query) {
  if (!query || !text) return [];
  const matches = [];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let idx = 0;
  while (idx < lower.length) {
    const found = lower.indexOf(q, idx);
    if (found === -1) break;
    // figure out 1-based line number and col
    const before = text.slice(0, found);
    const lineNum = before.split("\n").length;
    const lastNL = before.lastIndexOf("\n");
    const startCol = found - (lastNL + 1); // 0-based col
    matches.push({ charIdx: found, line: lineNum, startCol, endCol: startCol + q.length });
    idx = found + q.length;
  }
  return matches;
}

/* ─── Editor Theme Picker ──────────────────────────────── */

function EditorThemePicker({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Editor theme"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition"
        style={{ border: `1px solid ${theme.btnBorder}`, color: theme.btnFg }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
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
          {EDITOR_THEMES.map((t) => {
            const isActive = t.id === theme.id;
            return (
              <button key={t.id} onClick={() => { setTheme(t); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition"
                style={{ backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent", color: isActive ? "#ffffff" : theme.labelFg }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
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

/* ─── sub-components ──────────────────────────────────── */

function ToolbarBtn({ onClick, children, theme }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95"
      style={{ border: `1px solid ${theme.btnBorder}`, color: theme.btnFg }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {children}
    </button>
  );
}

function IndentPills({ indent, setIndent, theme }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>Indent:</span>
      {[2, 4, "tab"].map((v) => {
        const isActive = indent === v;
        return (
          <button key={v} type="button" onClick={() => setIndent(v)}
            className="rounded-md px-3 py-1.5 text-xs font-semibold transition"
            style={isActive
              ? { backgroundColor: theme.accent, color: theme.accentFg }
              : { border: `1px solid ${theme.btnBorder}`, color: theme.labelFg }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = theme.btnHover; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {v === "tab" ? "Tab" : `${v} spaces`}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Highlighted Output ──────────────────────────────── */

/**
 * Renders the output as a div with per-line line numbers and inline <mark> highlights.
 * Scrolls the active match into view automatically.
 */
function HighlightedOutput({ value, matches, activeMatchIdx, theme }) {
  const containerRef = useRef(null);
  const activeMarkRef = useRef(null);

  // Scroll the active match into view
  useEffect(() => {
    if (activeMarkRef.current && containerRef.current) {
      activeMarkRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeMatchIdx, matches]);

  const activeMatch = matches[activeMatchIdx] ?? null;

  // Build a list of lines, injecting highlight spans
  const lines = useMemo(() => toLines(value || ""), [value]);

  // Group matches by line
  const matchesByLine = useMemo(() => {
    const map = {};
    matches.forEach((m, i) => {
      if (!map[m.line]) map[m.line] = [];
      map[m.line].push({ ...m, globalIdx: i });
    });
    return map;
  }, [matches]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto rounded-lg font-mono text-[13px]"
      style={{
        backgroundColor: theme.panelBg,
        border: `1px solid ${theme.panelBorder}`,
        lineHeight: "20px",
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      {lines.map(({ n, text }) => {
        const lineMatches = matchesByLine[n] || [];

        // Build text with highlights
        let segments = [];
        let cursor = 0;
        for (const m of lineMatches) {
          const isActive = m.globalIdx === activeMatchIdx;
          if (m.startCol > cursor) {
            segments.push({ type: "text", content: text.slice(cursor, m.startCol) });
          }
          segments.push({ type: "mark", content: text.slice(m.startCol, m.endCol), isActive, globalIdx: m.globalIdx });
          cursor = m.endCol;
        }
        if (cursor < text.length) {
          segments.push({ type: "text", content: text.slice(cursor) });
        }
        if (segments.length === 0) {
          segments.push({ type: "text", content: text });
        }

        return (
          <div key={n} className="flex" style={{ lineHeight: "20px" }}>
            {/* Line number gutter */}
            <span
              className="select-none pr-3 text-right text-[11px] shrink-0"
              style={{ minWidth: 36, paddingLeft: 8, color: theme.gutterFg }}
            >
              {n}
            </span>
            {/* Line content */}
            <span className="pr-4 whitespace-pre" style={{ color: theme.editorFg }}>
              {segments.map((seg, si) =>
                seg.type === "text" ? (
                  <span key={si}>{seg.content}</span>
                ) : (
                  <mark
                    key={si}
                    ref={seg.isActive ? activeMarkRef : null}
                    style={{
                      backgroundColor: seg.isActive ? "#f59e0b" : "rgba(250,204,21,0.35)",
                      color: seg.isActive ? "#000" : "inherit",
                      borderRadius: 2,
                      outline: seg.isActive ? "2px solid #f59e0b" : "none",
                    }}
                  >
                    {seg.content}
                  </mark>
                )
              )}
            </span>
          </div>
        );
      })}
      {(!value) && (
        <p className="px-11 text-xs italic" style={{ color: theme.gutterFg }}>
          Output appears once JSON is valid…
        </p>
      )}
    </div>
  );
}

/* ─── Search Bar ──────────────────────────────────────── */

function SearchBar({ query, setQuery, matches, activeMatchIdx, onPrev, onNext, onClose, theme }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const total = matches.length;
  const current = total > 0 ? activeMatchIdx + 1 : 0;

  return (
    <div
      className="flex shrink-0 items-center gap-2 px-3 py-2"
      style={{ borderBottom: `1px solid ${theme.divider}`, backgroundColor: theme.shell }}
    >
      {/* Search icon */}
      <svg className="w-3.5 h-3.5 shrink-0" style={{ color: theme.labelFg }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
      </svg>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.shiftKey ? onPrev() : onNext(); }
          if (e.key === "Escape") onClose();
        }}
        placeholder="Search in output…"
        className="min-w-0 flex-1 bg-transparent text-xs outline-none"
        style={{ color: theme.editorFg }}
        spellCheck={false}
      />

      {/* Match counter */}
      <span className="shrink-0 text-xs tabular-nums" style={{ color: theme.gutterFg }}>
        {query ? (total === 0 ? "No results" : `${current} / ${total}`) : ""}
      </span>

      {/* Prev / Next */}
      {total > 1 && (
        <>
          <button
            onClick={onPrev}
            title="Previous match (Shift+Enter)"
            className="flex h-6 w-6 items-center justify-center rounded transition"
            style={{ color: theme.labelFg }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button
            onClick={onNext}
            title="Next match (Enter)"
            className="flex h-6 w-6 items-center justify-center rounded transition"
            style={{ color: theme.labelFg }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        title="Close search (Esc)"
        className="flex h-6 w-6 items-center justify-center rounded transition"
        style={{ color: theme.gutterFg }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; e.currentTarget.style.color = theme.labelFg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.gutterFg; }}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─── AnnotatedEditor (input only) ───────────────────── */

function AnnotatedEditor({ value, onChange, errorLine, readOnly = false, placeholder, theme }) {
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
    <div
      className="relative h-full min-h-0 overflow-hidden rounded-lg font-mono text-[13px] transition-colors"
      style={{ backgroundColor: theme.panelBg, border: `1px solid ${theme.panelBorder}` }}
    >
      <div ref={scrollRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ paddingTop: 12, paddingBottom: 12 }}>
        {lines.map(({ n }) => {
          const isErr = n === errorLine;
          return (
            <div key={n} className="relative flex" style={{ lineHeight: "20px" }}>
              <span className="select-none pr-3 text-right text-[11px]"
                style={{ minWidth: 36, paddingLeft: 8, color: isErr ? "#f87171" : theme.gutterFg }}>
                {n}
              </span>
              {isErr && <span className="absolute inset-0 border-l-2 border-red-500 bg-red-500/10" />}
            </div>
          );
        })}
      </div>
      <textarea
        ref={taRef}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        onScroll={syncScroll}
        placeholder={placeholder}
        spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none bg-transparent py-3 pr-4 outline-none transition-colors"
        style={{ paddingLeft: 44, lineHeight: "20px", color: theme.editorFg, caretColor: theme.accent }}
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

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  // Editor theme
  const [editorTheme, setEditorThemeState] = useState(
    () => EDITOR_THEMES.find((t) => t.id === DEFAULT_EDITOR_THEME_ID) ?? EDITOR_THEMES[0]
  );
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EDITOR_THEME_STORAGE_KEY);
      if (saved) {
        const found = EDITOR_THEMES.find((t) => t.id === saved);
        if (found) setEditorThemeState(found);
      }
    } catch {}
  }, []);
  const setEditorTheme = useCallback((t) => {
    setEditorThemeState(t);
    try { localStorage.setItem(EDITOR_THEME_STORAGE_KEY, t.id); } catch {}
  }, []);

  const { parsed, error, errorLine, errorCol } = useMemo(() => parseJSON(input), [input]);

  const output = useMemo(() => {
    if (!parsed) return "";
    const space = indent === "tab" ? "\t" : indent;
    return JSON.stringify(parsed, null, space);
  }, [parsed, indent]);

  // Recompute matches whenever query or output changes
  const matches = useMemo(() => findMatches(output, searchQuery), [output, searchQuery]);

  // Reset active index when matches list changes
  useEffect(() => {
    setActiveMatchIdx(0);
  }, [matches.length, searchQuery]);

  const isEmpty = !input.trim();
  const et = editorTheme;

  // Keyboard shortcut: Cmd/Ctrl+F to open search
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setActiveMatchIdx(0);
  }, []);
  const goNext = useCallback(() => {
    if (matches.length === 0) return;
    setActiveMatchIdx((i) => (i + 1) % matches.length);
  }, [matches.length]);
  const goPrev = useCallback(() => {
    if (matches.length === 0) return;
    setActiveMatchIdx((i) => (i - 1 + matches.length) % matches.length);
  }, [matches.length]);

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

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col transition-colors" style={{ backgroundColor: et.wrapperBg }}>
      {/* ── top bar ── */}
      <div className="flex h-12 shrink-0 items-center justify-between px-4 transition-colors"
        style={{ backgroundColor: et.shell, borderBottom: `1px solid ${et.shellBorder}` }}>
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md text-white" style={{ backgroundColor: et.accent }}>
              <Icon name="code" className="w-3.5 h-3.5" />
            </span>
            <span className="hidden text-sm font-bold text-white sm:block">
              <span style={{ color: et.accent }}>&#123;JSON&#125;</span> Academy
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className="rounded-md px-3 py-1.5 text-xs transition" style={{ color: et.labelFg }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = et.btnHover; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = et.labelFg; }}>
              Home
            </Link>
            <Link href="/tools" className="rounded-md px-3 py-1.5 text-xs transition" style={{ color: et.labelFg }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = et.btnHover; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = et.labelFg; }}>
              Tools
            </Link>
            <span className="ml-1 text-xs" style={{ color: et.gutterFg }}>/</span>
            <span className="ml-1 text-xs font-semibold" style={{ color: et.accent }}>JSON Formatter</span>
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <StatusDot error={error} empty={isEmpty} />
          <div className="h-4 w-px" style={{ backgroundColor: et.shellBorder }} />
          <IndentPills indent={indent} setIndent={setIndent} theme={et} />
        </div>

        <div className="flex items-center gap-2">
          <EditorThemePicker theme={et} setTheme={setEditorTheme} />
          {output && (
            <>
              <div className="h-4 w-px hidden sm:block" style={{ backgroundColor: et.shellBorder }} />
              <ToolbarBtn onClick={handleCopy} theme={et}>
                <Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </ToolbarBtn>
              <ToolbarBtn onClick={handleDownload} theme={et}>
                <Icon name="download" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">.json</span>
              </ToolbarBtn>
            </>
          )}
        </div>
      </div>

      {/* ── mobile — status + indent row ── */}
      <div className="flex h-10 shrink-0 items-center gap-3 px-4 md:hidden transition-colors"
        style={{ backgroundColor: et.shell, borderBottom: `1px solid ${et.shellBorder}` }}>
        <StatusDot error={error} empty={isEmpty} />
        <div className="h-4 w-px" style={{ backgroundColor: et.shellBorder }} />
        <IndentPills indent={indent} setIndent={setIndent} theme={et} />
      </div>

      {/* ── two-panel editor ── */}
      <div className="flex min-h-0 flex-1">
        {/* input panel */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between px-4 transition-colors"
            style={{ borderBottom: `1px solid ${et.divider}`, borderRight: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Input JSON</span>
            {input && (
              <button type="button" onClick={() => setInput("")} className="text-xs transition" style={{ color: et.gutterFg }}
                onMouseEnter={(e) => { e.currentTarget.style.color = et.labelFg; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = et.gutterFg; }}>
                Clear
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 p-3 transition-colors" style={{ borderRight: `1px solid ${et.divider}` }}>
            <AnnotatedEditor
              value={input}
              onChange={(e) => setInput(e.target.value)}
              errorLine={errorLine}
              theme={et}
            />
          </div>

          {error && (
            <div className="shrink-0 px-4 py-2.5 transition-colors"
              style={{ borderTop: "1px solid rgba(239,68,68,0.3)", backgroundColor: "rgba(220,38,38,0.10)" }}>
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
          {/* Output header */}
          <div className="flex h-9 shrink-0 items-center justify-between px-4 transition-colors"
            style={{ borderBottom: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Formatted output</span>
            <div className="flex items-center gap-2">
              {!output && error && (
                <span className="text-xs" style={{ color: et.gutterFg }}>Fix errors to see output</span>
              )}
              {/* Search toggle button */}
              {output && (
                <button
                  onClick={openSearch}
                  title="Search in output (Ctrl+F / ⌘F)"
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition"
                  style={{
                    border: `1px solid ${searchOpen ? et.accent : et.btnBorder}`,
                    color: searchOpen ? et.accent : et.labelFg,
                    backgroundColor: searchOpen ? `${et.accent}18` : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!searchOpen) e.currentTarget.style.backgroundColor = et.btnHover; }}
                  onMouseLeave={(e) => { if (!searchOpen) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                  </svg>
                  Search
                </button>
              )}
            </div>
          </div>

          {/* Search bar (shown when open) */}
          {searchOpen && (
            <SearchBar
              query={searchQuery}
              setQuery={setSearchQuery}
              matches={matches}
              activeMatchIdx={activeMatchIdx}
              onPrev={goPrev}
              onNext={goNext}
              onClose={closeSearch}
              theme={et}
            />
          )}

          {/* Output content */}
          <div className="min-h-0 flex-1 p-3">
            <HighlightedOutput
              value={output}
              matches={matches}
              activeMatchIdx={activeMatchIdx}
              theme={et}
            />
          </div>

          <div className="shrink-0 px-4 py-2 transition-colors"
            style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
            <p className="text-xs" style={{ color: et.footerFg }}>
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
