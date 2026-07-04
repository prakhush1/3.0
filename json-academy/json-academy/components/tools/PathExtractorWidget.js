"use client";

import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/Icon";
import ToolShell from "@/components/tools/ToolShell";
import useEditorTheme from "@/components/tools/useEditorTheme";

const SAMPLE = `{
  "platform": "JSON Tools",
  "tools": 9,
  "owner": { "name": "Ada", "active": true },
  "tags": ["json", "free"]
}`;

function extractPaths(value, path = "$", out = []) {
  if (value !== null && typeof value === "object") {
    const entries = Array.isArray(value)
      ? value.map((v, i) => [`[${i}]`, v])
      : Object.entries(value).map(([k, v]) => [`.${k}`, v]);
    if (entries.length === 0) out.push({ path, value });
    entries.forEach(([seg, v]) => extractPaths(v, path + seg, out));
  } else {
    out.push({ path, value });
  }
  return out;
}

function valueColor(v, theme) {
  if (v === null || typeof v === "boolean") return theme.accent;
  if (typeof v === "number") return theme.accent;
  if (typeof v === "string") return theme.accent;
  return theme.gutterFg;
}

const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset font-mono text-[13px]";

export default function PathExtractorWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [copiedPath, setCopiedPath] = useState("");
  const [filter, setFilter] = useState("");
  const { theme: et, setTheme } = useEditorTheme();

  const { paths, error } = useMemo(() => {
    if (!input.trim()) return { paths: [], error: "" };
    try { return { paths: extractPaths(JSON.parse(input)), error: "" }; }
    catch (e) { return { paths: [], error: e.message }; }
  }, [input]);

  const filtered = filter ? paths.filter((p) => p.path.toLowerCase().includes(filter.toLowerCase())) : paths;

  const copy = async (p) => {
    try { await navigator.clipboard.writeText(p); setCopiedPath(p); setTimeout(() => setCopiedPath(""), 1200); } catch {}
  };

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  return (
    <ToolShell title="JSON Path Extractor" activeSlug="json-path-extractor" theme={et} setTheme={setTheme} right={paths.length > 0 && (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: et.gutterFg }}>{filtered.length} of {paths.length} paths</span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter paths…"
          className="w-40 rounded-md px-3 py-1.5 text-xs outline-none placeholder:text-gray-600 focus:ring-1"
          style={{ border: `1px solid ${et.shellBorder}`, backgroundColor: et.shell, color: et.editorFg, "--tw-ring-color": et.accent }}
        />
      </div>
    )}>
      <div className="grid min-h-[640px] grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border" style={{ backgroundColor: et.panelBg, borderColor: et.panelBorder }}>
          <div className="flex h-11 shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: et.labelFg }}>Input JSON</span>
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
          <div className="flex h-11 shrink-0 items-center px-4" style={{ borderBottom: `1px solid ${et.divider}` }}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: et.labelFg }}>Paths — click any to copy</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {filtered.length > 0 ? (
              <div className="space-y-0.5 font-mono text-xs">
                {filtered.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => copy(p.path)}
                    className="group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition"
                    style={{ color: et.editorFg }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = et.btnHover; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <span className="shrink-0" style={{ color: et.accent }}>{p.path}</span>
                    <span style={{ color: et.gutterFg }}>=</span>
                    <span className="truncate" style={{ color: valueColor(p.value, et) }}>{JSON.stringify(p.value)}</span>
                    {copiedPath === p.path
                      ? <span className="ml-auto shrink-0 text-emerald-400"><Icon name="check-circle" className="h-3.5 w-3.5" /></span>
                      : <span className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" style={{ color: et.gutterFg }}><Icon name="copy" className="h-3.5 w-3.5" /></span>
                    }
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs" style={{ color: et.gutterFg }}>{error ? "Fix errors to extract paths" : "Paste JSON to see paths"}</p>
              </div>
            )}
          </div>
          <div className="shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${et.divider}`, backgroundColor: et.footerBg }}>
            <p className="text-xs" style={{ color: et.footerFg }}>{paths.length ? `${paths.length} leaf paths extracted · processed locally` : "Paste or type JSON in the input panel"}</p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
