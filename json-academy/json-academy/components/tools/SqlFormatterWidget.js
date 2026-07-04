"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE = `select id,name,email,created_at from users where active=true and country='US' order by created_at desc limit 50`;

const KEYWORDS = new Set([
  "select","from","where","and","or","not","in","as","on","join","left","right","inner","outer","full",
  "cross","apply","union","all","intersect","except","group","by","having","order","limit","offset","fetch",
  "first","next","row","rows","only","with","case","when","then","else","end","is","null","like","between",
  "exists","distinct","into","values","insert","update","set","delete","create","table","drop","alter","add",
  "column","primary","key","foreign","references","unique","index","view","truncate","begin","commit","rollback",
  "transaction","declare","cursor","fetch","procedure","function","return","returns","if","while","for","loop",
  "true","false","unknown",
]);

/* ─── Tokenizer ───────────────────────────────────────── */

function tokenize(sql) {
  const out = [];
  const re = /('[^']*(?:''[^']*)*')|("[^"]*(?:""[^"]*)*")|(--[^\n]*)|(\/\*[\s\S]*?\*\/)|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const v = m[0];
    if (m[1] || m[2]) out.push({ t: "string", v });
    else if (m[3] || m[4]) out.push({ t: "comment", v });
    else if (m[5]) out.push({ t: "number", v });
    else if (m[6]) {
      const lower = v.toLowerCase();
      if (KEYWORDS.has(lower)) out.push({ t: "keyword", v });
      else out.push({ t: "ident", v });
    }
    else if (m[7]) out.push({ t: "ws", v });
    else if (m[8]) {
      const ch = v;
      if ("(),;".includes(ch)) out.push({ t: "comma", v });
      else if ("=<>!+-*/%".includes(ch)) out.push({ t: "op", v });
      else out.push({ t: "punct", v });
    }
  }
  return out;
}

/* ─── Lightweight SQL formatter ────────────────────────── */

/* Top-level clauses that get their own line + uppercase keyword. */
const TOP = ["select","from","where","group","order","having","limit","offset","union","intersect","except","with","returning"];
const JOIN = ["join","left join","right join","inner join","outer join","full join","cross join"];
const ON   = ["on"];
const AND  = ["and","or"];

function isWord(t, w) {
  return t && t.t === "keyword" && t.v.toLowerCase() === w;
}

/**
 * Reformat SQL by:
 *  - uppercasing keywords
 *  - breaking before top-level clauses (select/from/where/...)
 *  - placing joins indented under from
 *  - aligning ON / AND / OR under their parent keyword
 *  - removing trailing spaces, normalising whitespace
 */
function formatSql(sql, indent) {
  const pad = indent === "tab" ? "\t" : " ".repeat(indent);
  const tokens = tokenize(sql).filter((t) => t.t !== "comment" && t.t !== "ws");
  const out = [];
  let depth = 0;
  let i = 0;
  let clause = "start";
  let afterSelect = false;

  const pushWs = () => { while (i < tokens.length && tokens[i].t === "ws") i++; };
  const peek = (off = 0) => tokens[i + off];
  const eat = () => tokens[i++];

  while (i < tokens.length) {
    pushWs();
    const t = peek();
    if (!t) break;
    const lower = t.v.toLowerCase();

    if (JOIN.includes(lower) || (t.t === "keyword" && JOIN.some((j) => j.startsWith(lower + " ") || j === lower))) {
      // detect 2-word joins like "left join"
      const a = peek();
      const b = peek(1);
      let jk;
      if (a && b && a.t === "keyword" && b.t === "keyword" && `${a.v} ${b.v}`.toLowerCase() === "left join") { jk = `${a.v} ${b.v}`.toUpperCase(); i += 2; }
      else if (a && b && a.t === "keyword" && b.t === "keyword" && `${a.v} ${b.v}`.toLowerCase() === "right join") { jk = `${a.v} ${b.v}`.toUpperCase(); i += 2; }
      else if (a && b && a.t === "keyword" && b.t === "keyword" && `${a.v} ${b.v}`.toLowerCase() === "inner join") { jk = `${a.v} ${b.v}`.toUpperCase(); i += 2; }
      else if (a && b && a.t === "keyword" && b.t === "keyword" && `${a.v} ${b.v}`.toLowerCase() === "outer join") { jk = `${a.v} ${b.v}`.toUpperCase(); i += 2; }
      else if (a && b && a.t === "keyword" && b.t === "keyword" && `${a.v} ${b.v}`.toLowerCase() === "full join") { jk = `${a.v} ${b.v}`.toUpperCase(); i += 2; }
      else if (a && b && a.t === "keyword" && b.t === "keyword" && `${a.v} ${b.v}`.toLowerCase() === "cross join") { jk = `${a.v} ${b.v}`.toUpperCase(); i += 2; }
      else { jk = a.v.toUpperCase(); i += 1; }
      out.push({ t: "nl", v: "\n" });
      out.push({ t: "indent", v: pad });
      out.push({ t: "keyword", v: jk });
      clause = "join";
      afterSelect = false;
      continue;
    }

    if (ON.includes(lower)) {
      out.push({ t: "nl", v: "\n" });
      out.push({ t: "indent", v: pad + pad });
      out.push({ t: "keyword", v: t.v.toUpperCase() });
      i++;
      clause = "on";
      afterSelect = false;
      continue;
    }

    if (AND.includes(lower) && (clause === "where" || clause === "on" || clause === "having")) {
      out.push({ t: "nl", v: "\n" });
      out.push({ t: "indent", v: pad + pad });
      out.push({ t: "keyword", v: t.v.toUpperCase() });
      i++;
      continue;
    }

    if (TOP.includes(lower) && t.t === "keyword") {
      out.push({ t: "nl", v: "\n" });
      out.push({ t: "indent", v: pad });
      out.push({ t: "keyword", v: t.v.toUpperCase() });
      i++;
      clause = lower;
      afterSelect = lower === "select";
      continue;
    }

    // Parens balance
    if (t.v === "(") {
      if (clause === "select" || clause === "on" || clause === "where") {
        out.push({ t: "ws", v: " " });
      } else {
        out.push({ t: "nl", v: "\n" });
        out.push({ t: "indent", v: pad.repeat(depth + 1) });
      }
      out.push({ t: "punct", v: "(" });
      depth++;
      i++;
      continue;
    }
    if (t.v === ")") {
      depth = Math.max(0, depth - 1);
      out.push({ t: "punct", v: ")" });
      i++;
      continue;
    }

    // comma → newline within select lists / value lists
    if (t.v === "," && (clause === "select" || clause === "group" || clause === "order")) {
      out.push({ t: "punct", v: "," });
      out.push({ t: "nl", v: "\n" });
      out.push({ t: "indent", v: pad + pad });
      i++;
      continue;
    }

    // operators / identifiers / literals: collapse whitespace before
    if (out.length > 0) {
      const prev = out[out.length - 1];
      if (prev.t !== "nl" && prev.t !== "indent") {
        out.push({ t: "ws", v: " " });
      }
    }

    // Uppercase keywords when emitting
    if (t.t === "keyword") {
      out.push({ t: "keyword", v: t.v.toUpperCase() });
    } else {
      out.push({ ...t });
    }
    i++;
  }

  // Stitch: collapse multiple ws, drop leading ws/newlines on lines
  let text = "";
  for (const t of out) {
    if (t.t === "indent") text += t.v;
    else if (t.t === "nl") { text = text.replace(/[ \t]+$/, ""); text += "\n"; }
    else if (t.t === "ws") { if (!text.endsWith(" ") && !text.endsWith("\n")) text += " "; }
    else text += t.v;
  }
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  return text;
}

/* ─── Highlight renderer ──────────────────────────────── */

function SqlView({ text, theme, mode }) {
  const lineToks = useMemo(() => {
    if (!text || mode === "plain") return [];
    const tokens = tokenize(text);
    const lines = text.split("\n");
    let pos = 0;
    let cursor = 0;
    return lines.map((line) => {
      const end = pos + line.length;
      const segs = [];
      while (cursor < tokens.length) {
        const tk = tokens[cursor];
        const start = text.indexOf(tk.v, pos);
        if (start === -1 || start > end) break;
        if (start >= end) break;
        segs.push(tk);
        cursor++;
        pos = start + tk.v.length;
        if (pos >= end) break;
      }
      return segs.length ? segs : [{ t: "ws", v: "" }];
    });
  }, [text, mode]);

  if (!text) return <p className="px-11 text-xs italic" style={{ color: theme.gutterFg }}>Empty</p>;
  const isLight = theme.wrapperBg && parseInt(theme.wrapperBg.replace("#",""), 16) > 0x888888;

  if (mode === "plain") {
    return (
      <pre className="font-mono text-[12.5px] leading-[20px] whitespace-pre-wrap break-all px-4 py-3"
        style={{ color: theme.editorFg }}>
        {text}
      </pre>
    );
  }

  const palette = {
    keyword: theme.accent,
    string:  isLight ? "#0f766e" : "#a5d8ff",
    number:  isLight ? "#b45309" : "#fbbf24",
    comment: isLight ? "#6b7280" : "#6b7280",
    ident:   theme.editorFg,
    punct:   theme.gutterFg,
    comma:   theme.gutterFg,
    op:      isLight ? "#be185d" : "#f472b6",
    ws:      theme.editorFg,
  };

  const lines = text.split("\n");

  return (
    <pre className="font-mono text-[12.5px] leading-[20px]" style={{ color: palette.ident }}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className="flex" style={{ lineHeight: "20px" }}>
          <span className="select-none pr-3 text-right text-[10px] shrink-0 pt-px"
            style={{ minWidth: 36, paddingLeft: 8, color: theme.gutterFg }}>{lineIdx + 1}</span>
          <span className="pr-4 whitespace-pre" style={{ flex: 1, minWidth: 0 }}>
            {(lineToks[lineIdx] || [{ t: "ws", v: "" }]).map((seg, si) => (
              <span key={si} style={{ color: palette[seg.t] || palette.ident }}>{seg.v}</span>
            ))}
          </span>
        </div>
      ))}
    </pre>
  );
}

/* ─── Reusable atoms ──────────────────────────────────── */

function ToolbarBtn({ onClick, children, theme, accent, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
      style={accent
        ? { backgroundColor: theme.accent, color: theme.accentFg }
        : { border: `1px solid ${theme.btnBorder}`, color: theme.btnFg, backgroundColor: theme.shell }}
      onMouseEnter={e => { if (!disabled && !accent) e.currentTarget.style.backgroundColor = theme.btnHover; }}
      onMouseLeave={e => { if (!disabled && !accent) e.currentTarget.style.backgroundColor = theme.shell; }}>
      {children}
    </button>
  );
}

function SectionHeader({ title, right, theme }) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between px-4"
      style={{ borderBottom: `1px solid ${et_divider(theme)}` }}>
      <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>{title}</span>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

function et_divider(theme) { return theme.divider; }

/* ─── TopBar ──────────────────────────────────────────── */

function TopBar({ title, right, theme }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-4"
      style={{ backgroundColor: theme.shell, borderBottom: `1px solid ${theme.shellBorder}` }}>
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
            <Icon name="braces" className="w-3.5 h-3.5" />
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

/* ─── Indent pills ────────────────────────────────────── */

function IndentPills({ indent, setIndent, theme }) {
  const opts = [{ v: 2, l: "2sp" }, { v: 4, l: "4sp" }, { v: "tab", l: "Tab" }];
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>Indent:</span>
      {opts.map((o) => {
        const isActive = indent === o.v;
        return (
          <button key={o.l} type="button" onClick={() => setIndent(o.v)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold transition"
            style={isActive ? { backgroundColor: theme.accent, color: theme.accentFg } : { border: `1px solid ${theme.btnBorder}`, color: theme.labelFg }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = theme.btnHover; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

function KeywordToggle({ value, onChange, theme }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold" style={{ color: theme.labelFg }}>Keywords:</span>
      <button type="button" onClick={() => onChange(!value ? "upper" : value === "upper" ? "lower" : "upper")}
        className="rounded-md px-2.5 py-1 text-xs font-semibold transition"
        style={{ border: `1px solid ${theme.btnBorder}`, color: theme.labelFg }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
        {value === "upper" ? "UPPER" : "lower"}
      </button>
    </div>
  );
}

/* ─── Main Widget ─────────────────────────────────────── */

export default function SqlFormatterWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [keywordCase, setKeywordCase] = useState("upper");
  const [outputMode, setOutputMode] = useState("formatted");
  const [copied, setCopied] = useState(false);
  const { theme: et, setTheme } = useEditorTheme();

  const formatted = useMemo(() => {
    if (!input.trim()) return "";
    try {
      let f = formatSql(input, indent);
      if (keywordCase === "lower") {
        // lowercase keywords only — keep identifiers intact
        f = tokenize(f).map((t) => (t.t === "keyword" ? { ...t, v: t.v.toLowerCase() } : t))
          .map((t) => t.v).join("");
      }
      return f;
    } catch (e) {
      return `-- formatter error: ${e.message}\n${input}`;
    }
  }, [input, indent, keywordCase]);

  const minified = useMemo(() => input.replace(/\s+/g, " ").trim(), [input]);

  const display = outputMode === "minified" ? minified : formatted;

  const handleCopy = useCallback(async () => {
    if (!display) return;
    try { await navigator.clipboard.writeText(display); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }, [display]);

  const handleDownload = useCallback(() => {
    if (!display) return;
    const blob = new Blob([display], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "formatted.sql"; a.click();
    URL.revokeObjectURL(url);
  }, [display]);

  const handleClear = () => setInput("");
  const handleSample = () => setInput(SAMPLE);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <ToolShell title="SQL Formatter" activeSlug="sql-formatter" theme={et} setTheme={setTheme} right={
      <>
        <IndentPills indent={indent} setIndent={setIndent} theme={et} />
        <KeywordToggle value={keywordCase} onChange={setKeywordCase} theme={et} />
        <ToolbarBtn theme={et} onClick={handleCopy}>
          <Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </ToolbarBtn>
        <ToolbarBtn theme={et} onClick={handleDownload}>
          <Icon name="download" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download</span>
        </ToolbarBtn>
      </>
    }>
      <div className="flex min-h-[760px] flex-col overflow-hidden rounded-[24px] border" style={{ borderColor: et.panelBorder, backgroundColor: et.panelBg }}>
        <div className="flex min-h-0 flex-1" style={{ borderTop: `1px solid ${et.shellBorder}` }}>
          {/* Input */}
          <div className="flex min-h-0 flex-col" style={{ width: "50%", borderRight: `1px solid ${et.divider}` }}>
            <div className="flex h-9 shrink-0 items-center justify-between px-4"
              style={{ borderBottom: `1px solid ${et.divider}` }}>
              <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Input SQL</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSample}
                  className="text-xs transition" style={{ color: et.gutterFg }}
                  onMouseEnter={e => { e.currentTarget.style.color = et.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.color = et.gutterFg; }}>Sample</button>
                {input && (
                  <button type="button" onClick={handleClear}
                    className="text-xs transition" style={{ color: et.gutterFg }}
                    onMouseEnter={e => { e.currentTarget.style.color = et.labelFg; }}
                    onMouseLeave={e => { e.currentTarget.style.color = et.gutterFg; }}>Clear</button>
                )}
              </div>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <div className="relative h-full overflow-hidden rounded-lg"
                style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
                  placeholder="Paste SQL to format…"
                  className="absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset font-mono text-[12.5px]"
                  style={{ color: et.editorFg, caretColor: et.accent, lineHeight: "20px", whiteSpace: "pre-wrap", overflowWrap: "break-word", overflowX: "hidden", overflowY: "auto" }} />
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-center justify-between px-4"
              style={{ borderBottom: `1px solid ${et.divider}` }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: et.labelFg }}>Output</span>
                <div className="flex items-center gap-1">
                  {["formatted","minified"].map((m) => {
                    const isActive = outputMode === m;
                    return (
                      <button key={m} type="button" onClick={() => setOutputMode(m)}
                        className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition"
                        style={isActive ? { backgroundColor: et.accent, color: et.accentFg } : { border: `1px solid ${et.btnBorder}`, color: et.labelFg }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = et.btnHover; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}>
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
              <span className="text-[10px] font-mono" style={{ color: et.gutterFg }}>
                {display ? `${display.split("\n").length} lines` : ""}
              </span>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <div className="relative h-full overflow-hidden rounded-lg"
                style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell }}>
                <div className="absolute inset-0 overflow-auto">
                  <SqlView text={display} theme={et} mode={outputMode} />
                </div>
              </div>
            </div>
            <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
              <p className="text-xs" style={{ color: et.footerFg }}>
                {display
                  ? `${display.split("\n").length} lines · ${new Blob([display]).size.toLocaleString()} bytes · processed locally`
                  : "Paste or type SQL in the input panel"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}

SqlFormatterWidget.fullBleed = true;