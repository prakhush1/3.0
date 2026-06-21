"use client";

import { useState, useMemo } from "react";
import Icon from "@/components/Icon";
import { Field, taClass } from "./Panel";

const SAMPLE = `{"name":"JSON Academy","tools":7,"private":true,}`;

export default function ValidatorWidget() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      JSON.parse(input);
      return { valid: true };
    } catch (e) {
      const match = /position (\d+)/.exec(e.message);
      let line = null;
      let col = null;
      if (match) {
        const pos = Number(match[1]);
        const before = input.slice(0, pos);
        line = before.split("\n").length;
        col = pos - before.lastIndexOf("\n");
      }
      return { valid: false, message: e.message, line, col };
    }
  }, [input]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <Field label="Paste JSON to validate">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className={taClass}
        />
      </Field>

      {result && (
        <div
          className={
            "mt-4 flex items-start gap-3 rounded-lg px-4 py-3 text-sm " +
            (result.valid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")
          }
        >
          <Icon name={result.valid ? "check-circle" : "zap"} className="mt-0.5 w-4 h-4 shrink-0" />
          {result.valid ? (
            <span>Valid JSON — no syntax errors found.</span>
          ) : (
            <span>
              Invalid JSON: {result.message}
              {result.line && ` (line ${result.line}, column ${result.col})`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
