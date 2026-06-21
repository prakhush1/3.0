"use client";

import { useState, useMemo } from "react";
import CopyButton from "./CopyButton";
import { Field, ErrorBanner, taClass } from "./Panel";

const SAMPLE = `Hello \\"World\\"!\\nLine two\\ttabbed`;

export default function UnescapeWidget() {
  const [input, setInput] = useState(SAMPLE);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    let body = input.trim();
    if (body.length >= 2 && body.startsWith('"') && body.endsWith('"')) {
      body = body.slice(1, -1);
    }
    try {
      return { output: JSON.parse(`"${body}"`), error: "" };
    } catch (e) {
      return { output: "", error: "Invalid escape sequence — " + e.message };
    }
  }, [input]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Escaped text">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className={taClass}
          />
        </Field>
        <Field label="Unescaped output" action={<CopyButton text={output} />}>
          <textarea readOnly value={output} spellCheck={false} className={taClass} />
        </Field>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}
