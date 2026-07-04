"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE_JSON = `[
  { "id": 1, "name": "Ada Lovelace", "role": "Engineer" },
  { "id": 2, "name": "Alan Turing", "role": "Mathematician" }
]`;

const SAMPLE_CSV = `id,name,role
1,Ada Lovelace,Engineer
2,Alan Turing,Mathematician`;

/* ─── conversion helpers ─────────────────────────────── */
function jsonToCsv(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data) || data.length === 0)
    throw new Error("Provide a non-empty JSON array of objects.");
  const headers = Array.from(data.reduce((s, r) => { Object.keys(r || {}).forEach((k) => s.add(k)); return s; }, new Set()));
  const esc = (v) => { if (v == null) return ""; const s = typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [headers.join(","), ...data.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

function parseLine(line) {
  const cells = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) { if (c === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (c === '"') inQ = false; else cur += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { cells.push(cur); cur = ""; }
    else cur += c;
  }
  cells.push(cur); return cells;
}

function csvToJson(text) {
  const lines = text.trim().split("\n");
  if (!lines.length) throw new Error("CSV is empty.");
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).filter((l) => l.trim());
  return JSON.stringify(rows.map((l) => { const c = parseLine(l); const o = {}; headers.forEach((h, i) => (o[h] = c[i] ?? "")); return o; }), null, 2);
}

/* ─── sub-components ─────────────────────────────────── */
function ToolbarBtn({ onClick, children, theme }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95"
      style={{ border: `1px solid ${theme.btnBorder}`, color: theme.btnFg }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
      {children}
    </button>
  );
}

const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset font-mono text-[13px]";

/* ─── main ───────────────────────────────────────────── */
export default function ConverterWidget() {
  const [dir, setDir] = useState("json-csv");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [copied, setCopied] = useState(false);
  const { theme: et, setTheme } = useEditorTheme();

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try { return { output: dir === "json-csv" ? jsonToCsv(input) : csvToJson(input), error: "" }; }
    catch (e) { return { output: "", error: e.message }; }
  }, [input, dir]);

  const swap = () => { setDir((d) => d === "json-csv" ? "csv-json" : "json-csv"); setInput(output || ""); };

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const ext = dir === "json-csv" ? "csv" : "json";
    const mime = dir === "json-csv" ? "text/csv" : "application/json";
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([output], { type: mime })), download: `converted.${ext}` });
    a.click(); URL.revokeObjectURL(a.href);
  }, [output, dir]);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  const inputLabel  = dir === "json-csv" ? "Input JSON array" : "Input CSV";
  const outputLabel = dir === "json-csv" ? "CSV output" : "JSON output";

  return (
    <ToolShell title="JSON ↔ CSV Converter" activeSlug="json-csv-converter" theme={et} setTheme={setTheme} right={
      <div className="flex items-center gap-2">
        <ToolbarBtn theme={et} onClick={swap}>
          <Icon name="repeat" className="w-3.5 h-3.5" />
          {dir === "json-csv" ? "JSON → CSV" : "CSV → JSON"}
        </ToolbarBtn>
        {output && (
          <>
            <ToolbarBtn theme={et} onClick={handleCopy}><Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}</ToolbarBtn>
            <ToolbarBtn theme={et} onClick={handleDownload}><Icon name="download" className="w-3.5 h-3.5" /><span className="hidden sm:inline">Download</span><span className="sm:hidden">.{dir === "json-csv" ? "csv" : "json"}</span></ToolbarBtn>
          </>
        )}
      </div>
    }>
      <div className="grid min-h-[640px] grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border" style={{ backgroundColor: et.panelBg, borderColor: et.panelBorder }}>
          <div className="flex h-11 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: et.labelFg }}>{inputLabel}</span>
            {input && <button type="button" onClick={() => setInput("")} className="text-xs transition" style={{ color: et.gutterFg }}>Clear</button>}
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.panelBorder}`, backgroundColor: et.shell }}>
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

        <div className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border" style={{ backgroundColor: et.panelBg, borderColor: et.panelBorder }}>
          <div className="flex h-11 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: et.labelFg }}>{outputLabel}</span>
            {!output && error && <span className="text-xs" style={{ color: et.gutterFg }}>Fix errors to see output</span>}
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg" style={{ border: `1px solid ${et.panelBorder}`, backgroundColor: et.shell }}>
              <textarea readOnly value={output} spellCheck={false} placeholder="Output appears here…" className={ta}
                style={{ lineHeight: "20px", color: et.editorFg, "--tw-ring-color": et.accent }} />
            </div>
          </div>
          <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
            <p className="text-xs" style={{ color: et.footerFg }}>{output ? `${output.split("\n").length} lines · ${new Blob([output]).size.toLocaleString()} bytes · processed locally` : "Paste or type in the input panel"}</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
