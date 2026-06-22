"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

const SAMPLE_A = `{"name":"JSON Academy","tools":7,"price":0}`;
const SAMPLE_B = `{"name":"JSON Academy","tools":8,"price":0,"signup":false}`;

/* ─── diff logic ─────────────────────────────────────── */
function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
function diff(a, b, path = "$") {
  const out = [];
  if (isObj(a) && isObj(b)) {
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
      const p = `${path}.${k}`;
      if (!(k in a)) out.push({ type: "added", path: p, value: b[k] });
      else if (!(k in b)) out.push({ type: "removed", path: p, value: a[k] });
      else out.push(...diff(a[k], b[k], p));
    });
  } else if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) out.push({ type: "added", path: p, value: b[i] });
      else if (i >= b.length) out.push({ type: "removed", path: p, value: a[i] });
      else out.push(...diff(a[i], b[i], p));
    }
  } else if (JSON.stringify(a) !== JSON.stringify(b)) {
    out.push({ type: "changed", path, from: a, to: b });
  }
  return out;
}

const BADGE = { added: "bg-emerald-950/60 border-emerald-900/50 text-emerald-400", removed: "bg-red-950/60 border-red-900/50 text-red-400", changed: "bg-amber-950/60 border-amber-900/50 text-amber-400" };
const DOT   = { added: "bg-emerald-400", removed: "bg-red-400", changed: "bg-amber-400" };

const ta = "absolute inset-0 h-full w-full resize-none bg-transparent py-3 px-4 font-mono text-[13px] text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-inset focus:ring-violet-500";

/* ─── main ───────────────────────────────────────────── */
export default function DiffCheckerWidget() {
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);

  const { changes, error } = useMemo(() => {
    if (!a.trim() || !b.trim()) return { changes: [], error: "" };
    try { return { changes: diff(JSON.parse(a), JSON.parse(b)), error: "" }; }
    catch (e) { return { changes: [], error: e.message }; }
  }, [a, b]);

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
            <span className="ml-1 text-xs font-semibold text-violet-400">JSON Diff Checker</span>
          </nav>
        </div>
        {!error && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">
              {changes.length === 0 ? "No differences" : `${changes.length} difference${changes.length > 1 ? "s" : ""}`}
            </span>
            <div className="flex gap-1.5">
              {["added","removed","changed"].map((t) => {
                const n = changes.filter((c) => c.type === t).length;
                if (!n) return null;
                return <span key={t} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${BADGE[t]}`}><span className={`h-1.5 w-1.5 rounded-full ${DOT[t]}`}/>{n} {t}</span>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* top two inputs */}
      <div className="flex h-[45%] shrink-0 divide-x divide-white/10 border-b border-white/10">
        {[{ label: "JSON A — original", val: a, set: setA }, { label: "JSON B — modified", val: b, set: setB }].map(({ label, val, set }) => (
          <div key={label} className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <span className="text-xs font-semibold text-gray-400">{label}</span>
              {val && <button type="button" onClick={() => set("")} className="text-xs text-gray-500 transition hover:text-gray-300">Clear</button>}
            </div>
            <div className="min-h-0 flex-1 p-3">
              <div className="relative h-full overflow-hidden rounded-lg border border-white/8 bg-[#0d1117]">
                <textarea value={val} onChange={(e) => set(e.target.value)} spellCheck={false} className={ta} style={{ lineHeight: "20px" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* diff results */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 items-center border-b border-white/10 px-4">
          <span className="text-xs font-semibold text-gray-400">Diff results</span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-3">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5">
              <Icon name="zap" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          {!error && changes.length === 0 && a.trim() && b.trim() && (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-2 text-emerald-400">
                <Icon name="check-circle" className="h-4 w-4" />
                <span className="text-sm font-semibold">No differences — both JSON documents are identical</span>
              </div>
            </div>
          )}
          {!error && changes.length > 0 && (
            <div className="space-y-1.5">
              {changes.map((c, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-lg border px-3 py-2 font-mono text-xs ${BADGE[c.type]}`}>
                  <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[c.type]}`} />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold uppercase tracking-wide">{c.type}</span>
                    {" "}<span className="opacity-70">{c.path}</span>
                    {c.type === "changed" && <span className="block mt-0.5 opacity-80">{JSON.stringify(c.from)} → {JSON.stringify(c.to)}</span>}
                    {c.type !== "changed" && <span className="ml-1 opacity-80">= {JSON.stringify(c.value)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 border-t border-white/10 px-4 py-2">
          <p className="text-xs text-gray-600">Comparison is key-order independent · processed locally</p>
        </div>
      </div>
    </div>
  );
}
