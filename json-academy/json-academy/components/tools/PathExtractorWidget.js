"use client";

import { useState, useMemo } from "react";
import { Field, ErrorBanner, taClass } from "./Panel";

const SAMPLE = `{
  "platform": "JSON Tools",
  "tools": 7,
  "owner": { "name": "Ada", "active": true },
  "tags": ["json", "free"]
}`;

function extractPaths(value, path = "$", out = []) {
  if (value && typeof value === "object") {
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

export default function PathExtractorWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [copiedPath, setCopiedPath] = useState("");

  const { paths, error } = useMemo(() => {
    if (!input.trim()) return { paths: [], error: "" };
    try {
      return { paths: extractPaths(JSON.parse(input)), error: "" };
    } catch (e) {
      return { paths: [], error: e.message };
    }
  }, [input]);

  const copy = async (p) => {
    try {
      await navigator.clipboard.writeText(p);
      setCopiedPath(p);
      setTimeout(() => setCopiedPath(""), 1200);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Input JSON">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className={taClass}
          />
        </Field>
        <Field label={`Paths (${paths.length}) — click to copy`}>
          <div className="h-64 space-y-1 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
            {paths.map((p) => (
              <button
                key={p.path}
                onClick={() => copy(p.path)}
                className="block w-full truncate rounded px-2 py-1 text-left font-mono text-xs hover:bg-violet-100"
                title={p.path}
              >
                <span className="text-violet-600">{p.path}</span>
                <span className="text-gray-400"> = {JSON.stringify(p.value)}</span>
                {copiedPath === p.path && <span className="ml-2 text-emerald-600">copied</span>}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}
