"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemePicker() {
  const { themeId, applyTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = themes.find((t) => t.id === themeId) ?? themes[0];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Change theme"
        aria-label="Change theme"
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:shadow-md"
      >
        {/* Swatch ring */}
        <span
          className="h-3.5 w-3.5 rounded-full ring-2 ring-offset-1"
          style={{ backgroundColor: active.swatch, ringColor: active.swatch }}
        />
        <span className="hidden sm:inline">{active.label}</span>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12" fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
          <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Theme
          </p>
          {themes.map((t) => {
            const isActive = t.id === themeId;
            return (
              <button
                key={t.id}
                onClick={() => { applyTheme(t.id); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full ring-2 ring-offset-1 shrink-0"
                  style={{ backgroundColor: t.swatch, ringColor: isActive ? t.swatch : "transparent" }}
                />
                <span className="flex-1">{t.label}</span>
                {isActive && (
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
