"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { TOOLS } from "@/lib/tools";
import { useState } from "react";

const CATEGORIES = ["Format", "Validate", "Convert", "View", "Compare", "Escape"];

export default function ToolRail({ activeSlug }) {
  const [collapsed, setCollapsed] = useState(false);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = TOOLS.filter((t) => t.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <aside
      className="hidden h-full shrink-0 flex-col sm:flex transition-all duration-300 overflow-y-auto"
      style={{
        width: collapsed ? "56px" : "220px",
        minWidth: collapsed ? "56px" : "220px",
      }}
    >
      <div
        className="h-full overflow-hidden flex flex-col"
        style={{ borderRight: "1px solid var(--color-line)", backgroundColor: "var(--color-surface)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-3 border-b"
          style={{ borderColor: "var(--color-line)" }}
        >
          {!collapsed && (
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-sub)" }}>
              Tools
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition hover:opacity-80 ${collapsed ? "mx-auto" : "ml-auto"}`}
            style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              {collapsed
                ? <path d="M9 18l6-6-6-6" />
                : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        </div>

        {/* Tool list */}
        <nav aria-label="Switch tool" className="p-2 flex flex-col gap-0.5">
          {Object.entries(grouped).map(([category, tools]) => (
            <div key={category}>
              {/* Category label */}
              {!collapsed && (
                <p
                  className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--color-sub)", opacity: 0.6 }}
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
                        ? { backgroundColor: "var(--color-brand)", color: "#ffffff" }
                        : { color: "var(--color-sub)" }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "var(--color-brand-50)";
                        e.currentTarget.style.color = "var(--color-brand)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "var(--color-sub)";
                      }
                    }}
                  >
                    {/* Icon */}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={isActive ? { backgroundColor: "rgba(255,255,255,0.2)" } : { backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}
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
                          style={{ opacity: isActive ? 0.75 : 0.6 }}
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
      </div>
    </aside>
  );
}
