"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

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
function ToolbarBtn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10 active:scale-95">
      {children}
    </button>
  );
}

const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 font-mono text-[13px] text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset focus:ring-violet-500";

/* ─── main ───────────────────────────────────────────── */
export default function ConverterWidget() {
  const [dir, setDir] = useState("json-csv");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [copied, setCopied] = useState(false);

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
    <div className="fixed inset-0 flex flex-col bg-[#0d1117]">
      {/* top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500 text-white"><Icon name="code" className="w-3.5 h-3.5" /></span>
            <span className="hidden text-sm font-bold text-white sm:block"><span className="text-violet-400">&#123;JSON&#125;</span> Academy</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className="rounded-md px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/8 hover:text-white">Home</Link>
            <Link href="/tools" className="rounded-md px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/8 hover:text-white">Tools</Link>
            <span className="ml-1 text-xs text-gray-600">/</span>
            <span className="ml-1 text-xs font-semibold text-violet-400">JSON ↔ CSV Converter</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ToolbarBtn onClick={swap}>
            <Icon name="repeat" className="w-3.5 h-3.5" />
            {dir === "json-csv" ? "JSON → CSV" : "CSV → JSON"}
          </ToolbarBtn>
          {output && (
            <>
              <ToolbarBtn onClick={handleCopy}><Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}</ToolbarBtn>
              <ToolbarBtn onClick={handleDownload}><Icon name="download" className="w-3.5 h-3.5" /><span className="hidden sm:inline">Download</span><span className="sm:hidden">.{dir === "json-csv" ? "csv" : "json"}</span></ToolbarBtn>
            </>
          )}
        </div>
      </div>

      {/* panels */}
      <div className="flex min-h-0 flex-1 divide-x divide-white/10">
        {/* input */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">{inputLabel}</span>
            {input && <button type="button" onClick={() => setInput("")} className="text-xs text-gray-500 transition hover:text-gray-300">Clear</button>}
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg border border-white/8 bg-[#0d1117]">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className={ta} style={{ lineHeight: "20px" }} />
            </div>
          </div>
          {error && (
            <div className="shrink-0 border-t border-red-900/50 bg-red-950/40 px-4 py-2.5">
              <div className="flex items-start gap-2">
                <Icon name="zap" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                <p className="text-xs leading-relaxed text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* output */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">{outputLabel}</span>
            {!output && error && <span className="text-xs text-gray-600">Fix errors to see output</span>}
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg border border-white/8 bg-[#0d1117]">
              <textarea readOnly value={output} spellCheck={false} placeholder="Output appears here…" className={ta} style={{ lineHeight: "20px" }} />
            </div>
          </div>
          <div className="shrink-0 border-t border-white/10 px-4 py-2">
            <p className="text-xs text-gray-600">{output ? `${output.split("\n").length} lines · ${new Blob([output]).size.toLocaleString()} bytes · processed locally` : "Paste or type in the input panel"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
