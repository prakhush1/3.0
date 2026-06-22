"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

const SAMPLE = `Hello \\"World\\"!\\nLine two\\ttabbed`;

function ToolbarBtn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10 active:scale-95">
      {children}
    </button>
  );
}

const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 font-mono text-[13px] text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset focus:ring-violet-500";

export default function UnescapeWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    let body = input.trim();
    if (body.length >= 2 && body.startsWith('"') && body.endsWith('"')) body = body.slice(1, -1);
    try { return { output: JSON.parse(`"${body}"`), error: "" }; }
    catch (e) { return { output: "", error: "Invalid escape sequence — " + e.message }; }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }, [output]);

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
            <span className="ml-1 text-xs font-semibold text-violet-400">JSON Unescape</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {output && <ToolbarBtn onClick={handleCopy}><Icon name={copied ? "check-circle" : "copy"} className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}</ToolbarBtn>}
        </div>
      </div>

      {/* panels */}
      <div className="flex min-h-0 flex-1 divide-x divide-white/10">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">Escaped text</span>
            {input && <button type="button" onClick={() => setInput("")} className="text-xs text-gray-500 transition hover:text-gray-300">Clear</button>}
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg border border-white/8 bg-[#0d1117]">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="Paste escaped text to unescape…" className={ta} style={{ lineHeight: "20px" }} />
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
          <div className="flex h-9 shrink-0 items-center border-b border-white/10 px-4">
            <span className="text-xs font-semibold text-gray-400">Unescaped output</span>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <div className="relative h-full overflow-hidden rounded-lg border border-white/8 bg-[#0d1117]">
              <textarea readOnly value={output} spellCheck={false} placeholder="Unescaped text appears here…" className={ta} style={{ lineHeight: "20px" }} />
            </div>
          </div>
          <div className="shrink-0 border-t border-white/10 px-4 py-2">
            <p className="text-xs text-gray-600">{output ? `${output.length.toLocaleString()} chars · processed locally` : "Paste escaped text in the input panel"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
