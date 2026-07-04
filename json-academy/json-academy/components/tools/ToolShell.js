"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import FormatterToolPanel from "@/components/tools/FormatterToolPanel";
import { EDITOR_THEMES } from "@/lib/themes";

function ThemePicker({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="Editor theme"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition"
        style={{ border: `1px solid ${theme.btnBorder}`, color: theme.btnFg }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <span className="h-3 w-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: theme.accent }} />
        <span className="hidden sm:inline">{theme.label}</span>
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl p-1.5 shadow-2xl" style={{ backgroundColor: theme.shell, border: `1px solid ${theme.shellBorder}` }}>
          <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.labelFg }}>Editor Colour</p>
          {EDITOR_THEMES.map((option) => {
            const isActive = option.id === theme.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => { setTheme(option); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition"
                style={{ backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent", color: isActive ? "#ffffff" : theme.labelFg }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/10" style={{ backgroundColor: option.swatch }} />
                <span className="flex-1">{option.label}</span>
                {isActive && (
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

export default function ToolShell({ title, activeSlug, theme, setTheme, right, children, contentClassName }) {
  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto p-3 transition-colors sm:p-4 lg:p-6"
      style={{
        backgroundColor: theme.wrapperBg,
        backgroundImage: theme.extra?.bgMesh || "none",
      }}
    >
      <div
        className="mx-auto flex min-h-[760px] w-full max-w-[1600px] flex-col overflow-visible rounded-[32px] border shadow-2xl"
        style={{
          backgroundColor: theme.shell,
          borderColor: theme.shellBorder,
          boxShadow: theme.extra?.glow || "0 20px 60px rgba(0, 0, 0, 0.18)",
        }}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-5" style={{ borderBottom: `1px solid ${theme.shellBorder}` }}>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: theme.accent, color: theme.accentFg }}>
                <Icon name="code" className="h-4 w-4" />
              </span>
              <span className="hidden text-sm font-bold sm:block" style={{ color: theme.editorFg }}>
                <span style={{ color: theme.accent }}>JSON</span> Academy
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/" className="rounded-lg px-3 py-1.5 text-xs transition" style={{ color: theme.labelFg }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; e.currentTarget.style.color = theme.editorFg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.labelFg; }}>Home</Link>
              <Link href="/tools" className="rounded-lg px-3 py-1.5 text-xs transition" style={{ color: theme.labelFg }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.btnHover; e.currentTarget.style.color = theme.editorFg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = theme.labelFg; }}>Tools</Link>
              <span className="ml-1 text-xs" style={{ color: theme.gutterFg }}>/</span>
              <span className="ml-1 text-xs font-semibold" style={{ color: theme.accent }}>{title}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {right}
            <ThemePicker theme={theme} setTheme={setTheme} />
          </div>
        </div>

        <div className={`flex-1 p-3 sm:p-4 lg:p-5 ${contentClassName || ""}`}>{children}</div>
        <FormatterToolPanel theme={theme} activeSlug={activeSlug} />
      </div>
    </div>
  );
}
