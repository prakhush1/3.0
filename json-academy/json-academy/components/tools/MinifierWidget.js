"use client";

import { useState, useMemo } from "react";
import CopyButton from "./CopyButton";
import { Field, ErrorBanner, taClass } from "./Panel";

const SAMPLE = `{
  "name": "JSON Academy",
  "tools": 7,
  "private": true,
  "tags": ["json", "tools", "free"]
}`;

export default function MinifierWidget() {
  const [input, setInput] = useState(SAMPLE);

  const { output, error, saved } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "", saved: 0 };
    try {
      const parsed = JSON.parse(input);
      const out = JSON.stringify(parsed);
      const pct = Math.max(0, Math.round((1 - out.length / input.length) * 100));
      return { output: out, error: "", saved: pct };
    } catch (e) {
      return { output: "", error: e.message, saved: 0 };
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
            className={taClass}
          />
        </Field>
        <Field
          label={output ? `Minified — ${saved}% smaller` : "Minified output"}
          action={<CopyButton text={output} />}
        >
          <textarea readOnly value={output} spellCheck={false} className={taClass} />
        </Field>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}
