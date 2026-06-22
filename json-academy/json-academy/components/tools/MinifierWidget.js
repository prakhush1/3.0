"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

const SAMPLE = `{\n  "name": "JSON Academy",\n  "tools": 9,\n  "private": true,\n  "tags": ["json", "tools", "free"]\n}`;

function ToolbarBtn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10 active:scale-95">
      {children}
    </button>
  );
}

export default function MinifierWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const { output, error, saved } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "", saved: 0 };
    try {
      const out = JSON.stringify(JSON.parse(input));
      const pct = Math.max(0, Math.round((1 - out.length / input.length) * 100));
      return { output: out, error: "", saved: pct };
    } catch (e) { return { output: "", error: e.message, saved: 0 }; }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([output], { type: "application/json" })), download: "minified.json" });
    a.click(); URL.revokeObjectURL(a.href);
  }, [output]);

  useEffect(() => { document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = ""; }; }, []);

  const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset focus:ring-violet-500 font-mono text-[13px]";

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0d1117]">
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
            <span className="ml-1 text-xs font-semibold text-violet-400">JSON Minifier</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {output && <><ToolbarBtn onClick={handleCopy}><Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}</ToolbarBtn><ToolbarBtn onClick={handleDownload}><Icon name="download" className="w-3.5 h-3.5" /><span className="hidden sm:inline">Download</span><span className="sm:hidden">.json</span></ToolbarBtn></>}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 divide-x divide-white/10">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">Input JSON</span>
            {input && <button type="button" onClick={() => setInput("")} className="text-xs text-gray-500 hover:text-gray-300 transition">Clear</button>}
          </div>
          <div className="relative min-h-0 flex-1 p-3">
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

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">{output ? `Minified — ${saved}% smaller` : "Minified output"}</span>
            {!output && error && <span className="text-xs text-gray-600">Fix errors to see output</span>}
          </div>
          <div className="relative min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg border border-white/8 bg-[#0d1117]">
              <textarea readOnly value={output} spellCheck={false} placeholder="Output appears once JSON is valid…" className={ta} style={{ lineHeight: "20px" }} />
            </div>
          </div>
          <div className="shrink-0 border-t border-white/10 px-4 py-2">
            <p className="text-xs text-gray-600">{output ? `${output.length.toLocaleString()} bytes · processed locally` : "Paste or type JSON in the input panel"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
