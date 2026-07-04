"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { TOOLS } from "@/lib/tools";

export default function FormatterToolPanel({ theme, activeSlug }) {
  return (
    <aside
      className="shrink-0 border-t px-3 py-3 sm:px-4"
      style={{
        backgroundColor: theme.shell,
        borderColor: theme.shellBorder,
        color: theme.labelFg,
      }}
      aria-label="Switch tool"
    >
      <nav className="flex flex-wrap items-center gap-2 overflow-x-auto">
        {TOOLS.map((tool) => {
          const isActive = tool.slug === activeSlug;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              title={tool.title}
              aria-label={tool.title}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center gap-2 rounded-2xl border px-3 py-2 text-[11px] font-semibold transition-all duration-150 whitespace-nowrap"
              style={
                isActive
                  ? {
                      backgroundColor: theme.accent,
                      color: theme.accentFg,
                      borderColor: theme.accent,
                    }
                  : {
                      backgroundColor: `${theme.accent}12`,
                      color: theme.labelFg,
                      borderColor: theme.shellBorder,
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = theme.btnHover;
                  e.currentTarget.style.color = theme.editorFg;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = `${theme.accent}12`;
                  e.currentTarget.style.color = theme.labelFg;
                }
              }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                style={
                  isActive
                    ? { backgroundColor: "rgba(255,255,255,0.2)" }
                    : { backgroundColor: `${theme.accent}22`, color: theme.accent }
                }
              >
                <Icon name={tool.icon} className="h-3.5 w-3.5" />
              </span>
              <span>{tool.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}