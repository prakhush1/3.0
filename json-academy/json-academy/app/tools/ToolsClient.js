"use client";

import { useState, useMemo } from "react";
import Icon from "@/components/Icon";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TOOLS } from "@/lib/tools";

const FILTERS = ["All Tools", "Format", "Validate", "Convert", "View", "Compare", "Escape"];

export default function ToolsClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All Tools");

  const filtered = useMemo(() => {
    return TOOLS.filter((t) => {
      const matchesFilter = filter === "All Tools" || t.category === filter;
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <main className="overflow-x-hidden">
      <Nav active="tools" />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <p className="text-xs font-bold tracking-widest" style={{ color: "var(--color-brand)" }}>// TOOLS</p>
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl">
          JSON <span style={{ color: "var(--color-brand)" }}>Toolbox</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-500">
          Fast, free, and privacy-first JSON utilities. Everything runs in
          your browser — no data ever leaves your device.
        </p>

        {/* search + filters */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-lg border px-4 py-3" style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)" }}>
            <Icon name="search" className="w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full bg-transparent text-sm placeholder-gray-400 outline-none"
              style={{ color: "var(--color-ink)" }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold transition"
                style={
                  filter === f
                    ? { backgroundColor: "var(--color-brand)", color: "#ffffff" }
                    : { border: "1px solid var(--color-line)", backgroundColor: "var(--color-surface)", color: "var(--color-ink)" }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {filtered.map((t) => (
            <a
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="group rounded-2xl border p-6 transition hover:shadow-md"
              style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}>
                  <Icon name={t.icon} className="w-5 h-5" />
                </div>
                <Icon name="arrow-right" className="w-4 h-4 text-gray-300 transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-5 text-xs text-gray-400">{t.tag}</p>
              <h3 className="mt-1 text-lg font-bold">{t.title}</h3>
              <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--color-brand)" }}>{t.sub}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{t.shortDesc}</p>
            </a>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-gray-400">
              No tools match your search.
            </p>
          )}
        </div>
      </section>

      <div className="h-16" />
      <Footer />
    </main>
  );
}
