"use client";

import { useState, useMemo } from "react";
import CopyButton from "./CopyButton";
import { Field, taClass } from "./Panel";

const SAMPLE = `Hello "World"!
Line two	tabbed`;

export default function EscapeWidget() {
  const [input, setInput] = useState(SAMPLE);

  const output = useMemo(() => {
    if (!input) return "";
    return JSON.stringify(input).slice(1, -1);
  }, [input]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Raw text">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className={taClass}
          />
        </Field>
        <Field label="Escaped output" action={<CopyButton text={output} />}>
          <textarea readOnly value={output} spellCheck={false} className={taClass} />
        </Field>
      </div>
    </div>
  );
}
