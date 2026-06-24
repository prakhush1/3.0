"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { TOOLS } from "@/lib/tools";
import { useState } from "react";

const CATEGORIES = ["Format", "Validate", "Convert", "View", "Compare", "Escape"];

/**
 * Editor-themed collapsible tool navigation panel.
 * Used by every tool widget (formatter + the rest) so users can jump
 * between tools without leaving the page.
 * Reads the active editor palette (shell / accent / labelFg / etc.).
 */
export default function FormatterToolPanel({ theme, activeSlug }) {
  const [collapsed, setCollapsed] = useState(false);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = TOOLS.filter((t) => t.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <aside
      className="hidden h-full shrink-0 flex-col transition-all duration-300 overflow-y-auto sm:flex"
      style={{
        width: collapsed ? "56px" : "220px",
        minWidth: collapsed ? "56px" : "220px",
        backgroundColor: theme.shell,
        borderRight: `1px solid ${theme.shellBorder}`,
        color: theme.labelFg,
      }}
      aria-label="Switch tool"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${theme.shellBorder}` }}
      >
        {!collapsed && (
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: theme.gutterFg }}
          >
            Tools
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition hover:opacity-80 ${collapsed ? "mx-auto" : "ml-auto"}`}
          style={{
            backgroundColor: `${theme.accent}22`,
            color: theme.accent,
          }}
          title={collapsed ? "Expand tools panel" : "Collapse tools panel"}
          aria-label={collapsed ? "Expand tools panel" : "Collapse tools panel"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      {/* Tool list */}
      <nav className="p-2 flex flex-col gap-0.5">
        {Object.entries(grouped).map(([category, tools]) => (
          <div key={category}>
            {!collapsed && (
              <p
                className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: theme.gutterFg, opacity: 0.85 }}
              >
                {category}
              </p>
            )}
            {collapsed && <div className="h-2" />}

            {tools.map((t) => {
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  title={t.title}
                  aria-label={t.title}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-all duration-150"
                  style={
                    isActive
                      ? { backgroundColor: theme.accent, color: theme.accentFg }
                      : { color: theme.labelFg }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = theme.btnHover;
                      e.currentTarget.style.color = theme.editorFg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = theme.labelFg;
                    }
                  }}
                >
                  {/* Icon */}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={
                      isActive
                        ? { backgroundColor: "rgba(255,255,255,0.2)" }
                        : { backgroundColor: `${theme.accent}22`, color: theme.accent }
                    }
                  >
                    <Icon name={t.icon} className="w-3.5 h-3.5" />
                  </span>

                  {/* Label */}
                  {!collapsed && (
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-xs font-semibold leading-tight">
                        {t.title}
                      </p>
                      <p
                        className="truncate text-[10px] leading-tight mt-0.5"
                        style={{ opacity: isActive ? 0.8 : 0.6 }}
                      >
                        {t.sub}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}