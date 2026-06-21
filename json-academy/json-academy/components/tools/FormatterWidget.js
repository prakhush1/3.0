"use client";

import { useState, useMemo } from "react";
import CopyButton from "./CopyButton";
import { Field, ErrorBanner, taClass } from "./Panel";

const SAMPLE = `{"name":"JSON Academy","tools":7,"private":true,"tags":["json","tools","free"]}`;

export default function FormatterWidget() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      const space = indent === "tab" ? "\t" : indent;
      return { output: JSON.stringify(parsed, null, space), error: "" };
    } catch (e) {
      return { output: "", error: e.message };
    }
  }, [input, indent]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">Indent:</span>
        {[2, 4, "tab"].map((v) => (
          <button
            key={v}
            onClick={() => setIndent(v)}
            className={
              "rounded-md px-3 py-1.5 text-xs font-semibold " +
              (indent === v ? "bg-violet-500 text-white" : "border border-gray-200 hover:bg-gray-50")
            }
          >
            {v === "tab" ? "Tab" : `${v} spaces`}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Input JSON">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className={taClass}
          />
        </Field>
        <Field label="Formatted output" action={<CopyButton text={output} />}>
          <textarea readOnly value={output} spellCheck={false} className={taClass} />
        </Field>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}
