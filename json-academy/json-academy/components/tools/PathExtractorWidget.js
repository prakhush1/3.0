"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

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

function valueColor(v) {
  if (v === null || typeof v === "boolean") return "text-violet-400";
  if (typeof v === "number") return "text-orange-400";
  if (typeof v === "string") return "text-emerald-400";
  return "text-gray-400";
}

const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 font-mono text-[13px] text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset focus:ring-violet-500";

export default function PathExtractorWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [copiedPath, setCopiedPath] = useState("");
  const [filter, setFilter] = useState("");

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
            <span className="ml-1 text-xs font-semibold text-violet-400">JSON Path Extractor</span>
          </nav>
        </div>
        {paths.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{filtered.length} of {paths.length} paths</span>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter paths…"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 outline-none placeholder:text-gray-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 w-40"
            />
          </div>
        )}
      </div>

      {/* panels */}
      <div className="flex min-h-0 flex-1 divide-x divide-white/10">
        {/* input */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">Input JSON</span>
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

        {/* paths list */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">Paths — click any to copy</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {filtered.length > 0 ? (
              <div className="space-y-0.5 font-mono text-xs">
                {filtered.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => copy(p.path)}
                    className="group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition hover:bg-white/5"
                  >
                    <span className="shrink-0 text-violet-400">{p.path}</span>
                    <span className="text-gray-600">=</span>
                    <span className={`truncate ${valueColor(p.value)}`}>{JSON.stringify(p.value)}</span>
                    {copiedPath === p.path
                      ? <span className="ml-auto shrink-0 text-emerald-400"><Icon name="check-circle" className="h-3.5 w-3.5" /></span>
                      : <span className="ml-auto shrink-0 text-gray-700 opacity-0 transition group-hover:opacity-100"><Icon name="copy" className="h-3.5 w-3.5" /></span>
                    }
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-gray-600">{error ? "Fix errors to extract paths" : "Paste JSON to see paths"}</p>
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-white/10 px-4 py-2">
            <p className="text-xs text-gray-600">{paths.length ? `${paths.length} leaf paths extracted · processed locally` : "Paste or type JSON in the input panel"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
