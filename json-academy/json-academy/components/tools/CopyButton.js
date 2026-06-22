"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

export default function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-ink)",
      }}
    >
      <Icon name={copied ? "check-circle" : "braces"} className="w-3.5 h-3.5" />
      {copied ? "Copied!" : label}
    </button>
  );
}
