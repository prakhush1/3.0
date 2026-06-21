"use client";

import { useState, useMemo } from "react";
import CopyButton from "./CopyButton";
import { Field, ErrorBanner, taClass } from "./Panel";

const SAMPLE = `[
  { "id": 1, "name": "Ada Lovelace", "role": "Engineer" },
  { "id": 2, "name": "Alan Turing", "role": "Mathematician" }
]`;

function jsonToCsv(jsonText) {
  const data = JSON.parse(jsonText);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Provide a non-empty JSON array of objects.");
  }
  const headers = Array.from(
    data.reduce((set, row) => {
      Object.keys(row || {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  const escape = (val) => {
    if (val === undefined || val === null) return "";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(",")];
  data.forEach((row) => lines.push(headers.map((h) => escape(row[h])).join(",")));
  return lines.join("\n");
}

function parseCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

function csvToJson(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length < 1) throw new Error("CSV is empty.");
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).filter((l) => l.trim() !== "");
  const data = rows.map((line) => {
    const cells = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cells[i] ?? ""));
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

export default function ConverterWidget() {
  const [direction, setDirection] = useState("json-csv");
  const [input, setInput] = useState(SAMPLE);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const out = direction === "json-csv" ? jsonToCsv(input) : csvToJson(input);
      return { output: out, error: "" };
    } catch (e) {
      return { output: "", error: e.message };
    }
  }, [input, direction]);

  const toggle = () => {
    setDirection((d) => (d === "json-csv" ? "csv-json" : "json-csv"));
    setInput(output || "");
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-md bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-600">
          {direction === "json-csv" ? "JSON → CSV" : "CSV → JSON"}
        </span>
        <button
          onClick={toggle}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
        >
          Swap direction
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={direction === "json-csv" ? "Input JSON array" : "Input CSV"}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className={taClass}
          />
        </Field>
        <Field label={direction === "json-csv" ? "CSV output" : "JSON output"} action={<CopyButton text={output} />}>
          <textarea readOnly value={output} spellCheck={false} className={taClass} />
        </Field>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}
