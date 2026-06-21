"use client";

import { useState, useMemo } from "react";
import { Field, ErrorBanner, taClass } from "./Panel";

const SAMPLE_A = `{"name":"JSON Academy","tools":7,"price":0}`;
const SAMPLE_B = `{"name":"JSON Academy","tools":8,"price":0,"signup":false}`;

function isObj(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function diff(a, b, path = "$") {
  const changes = [];
  if (isObj(a) && isObj(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    keys.forEach((k) => {
      const p = `${path}.${k}`;
      if (!(k in a)) changes.push({ type: "added", path: p, value: b[k] });
      else if (!(k in b)) changes.push({ type: "removed", path: p, value: a[k] });
      else changes.push(...diff(a[k], b[k], p));
    });
  } else if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) changes.push({ type: "added", path: p, value: b[i] });
      else if (i >= b.length) changes.push({ type: "removed", path: p, value: a[i] });
      else changes.push(...diff(a[i], b[i], p));
    }
  } else if (JSON.stringify(a) !== JSON.stringify(b)) {
    changes.push({ type: "changed", path, from: a, to: b });
  }
  return changes;
}

const STYLES = {
  added: "bg-emerald-50 text-emerald-700",
  removed: "bg-red-50 text-red-600",
  changed: "bg-amber-50 text-amber-700",
};

export default function DiffCheckerWidget() {
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);

  const { changes, error } = useMemo(() => {
    if (!a.trim() || !b.trim()) return { changes: [], error: "" };
    try {
      const objA = JSON.parse(a);
      const objB = JSON.parse(b);
      return { changes: diff(objA, objB), error: "" };
    } catch (e) {
      return { changes: [], error: e.message };
    }
  }, [a, b]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="JSON A (original)">
          <textarea value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} className={taClass} />
        </Field>
        <Field label="JSON B (modified)">
          <textarea value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} className={taClass} />
        </Field>
      </div>
      <ErrorBanner message={error} />
      {!error && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">
            {changes.length === 0 ? "No differences found" : `${changes.length} difference${changes.length > 1 ? "s" : ""} found`}
          </p>
          <div className="max-h-56 space-y-1.5 overflow-auto">
            {changes.map((c, i) => (
              <div key={i} className={"rounded-lg px-3 py-2 font-mono text-xs " + STYLES[c.type]}>
                <span className="font-bold uppercase">{c.type}</span> {c.path}{" "}
                {c.type === "changed" && (
                  <span>
                    : {JSON.stringify(c.from)} → {JSON.stringify(c.to)}
                  </span>
                )}
                {c.type !== "changed" && <span>: {JSON.stringify(c.value)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
