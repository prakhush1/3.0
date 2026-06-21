"use client";

import { useState, useMemo } from "react";
import Icon from "@/components/Icon";
import { Field, ErrorBanner, taLightClass } from "./Panel";

const SAMPLE = `{
  "platform": "JSON Tools",
  "tools": 7,
  "active": true,
  "owner": null,
  "tags": ["json", "free", "private"],
  "meta": { "version": "2.0", "open": false }
}`;

function valueColor(v) {
  if (typeof v === "string") return "text-emerald-600";
  if (typeof v === "number") return "text-orange-500";
  if (typeof v === "boolean" || v === null) return "text-violet-500";
  return "text-[#171717]";
}

function formatPrimitive(v) {
  if (v === null) return "null";
  if (typeof v === "string") return `"${v}"`;
  return String(v);
}

function TreeNode({ k, value, depth, expandAll }) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = value && typeof value === "object";
  const expanded = expandAll === null ? open : expandAll;

  if (!isObj) {
    return (
      <div className="py-0.5 pl-4" style={{ marginLeft: depth * 14 }}>
        {k !== undefined && <span className="text-[#171717]">&quot;{k}&quot;: </span>}
        <span className={valueColor(value)}>{formatPrimitive(value)}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);

  return (
    <div className="py-0.5" style={{ marginLeft: depth * 14 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 pl-4 text-left hover:text-violet-500"
      >
        <Icon name="arrow-right" className={"w-3 h-3 transition " + (expanded ? "rotate-90" : "")} />
        {k !== undefined && <span className="text-[#171717]">&quot;{k}&quot;: </span>}
        <span className="text-gray-400">
          {isArray ? `Array(${entries.length})` : `Object(${entries.length})`}
        </span>
      </button>
      {expanded && (
        <div>
          {entries.map(([ck, cv]) => (
            <TreeNode key={ck} k={ck} value={cv} depth={depth + 1} expandAll={expandAll} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeViewerWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [expandAll, setExpandAll] = useState(null);

  const { data, error } = useMemo(() => {
    if (!input.trim()) return { data: null, error: "" };
    try {
      return { data: JSON.parse(input), error: "" };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [input]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Input JSON">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className={taLightClass}
          />
        </Field>
        <Field
          label="Interactive tree"
          action={
            <div className="flex gap-2">
              <button onClick={() => setExpandAll(true)} className="text-xs font-semibold text-violet-500 hover:underline">
                Expand all
              </button>
              <button onClick={() => setExpandAll(false)} className="text-xs font-semibold text-gray-500 hover:underline">
                Collapse all
              </button>
            </div>
          }
        >
          <div className="h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-[13px]">
            {data && <TreeNode value={data} depth={0} expandAll={expandAll} />}
          </div>
        </Field>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}
