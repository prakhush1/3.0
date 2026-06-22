import Link from "next/link";
import Icon from "./Icon";
import ThemePicker from "./ThemePicker";

function NavLink({ href, label, isActive }) {
  const braceClass =
    "opacity-0 transition-opacity duration-200 group-hover:opacity-100";

  return (
    <Link
      href={href}
      className={
        "group relative flex items-center gap-1 pb-1.5 transition-colors " +
        (isActive ? "text-[var(--color-brand)]" : "text-gray-600 hover:text-[var(--color-brand)]")
      }
    >
      {!isActive && <span className={braceClass} style={{ color: "var(--color-sub)" }}>{"{"}</span>}
      <span>{label}</span>
      {!isActive && <span className={braceClass} style={{ color: "var(--color-sub)" }}>{"}"}</span>}
      <span
        className={
          "absolute -bottom-px left-0 h-0.5 transition-all duration-200 " +
          (isActive ? "w-full" : "w-0")
        }
        style={{ backgroundColor: "var(--color-brand)" }}
      />
    </Link>
  );
}

export default function Nav({ active = "home" }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: "var(--color-brand)" }}
        >
          <Icon name="code" className="w-4 h-4" />
        </span>
        <span className="text-base font-bold">
          <span style={{ color: "var(--color-brand)" }}>{"{"}</span>
          <span style={{ color: "var(--color-brand)" }}>JSON</span>
          <span style={{ color: "var(--color-brand)" }}>{"}"}</span>
          {" "}Academy
        </span>
      </Link>

      <nav className="hidden gap-8 text-sm font-medium md:flex">
        <NavLink href="/" label="Home" isActive={active === "home"} />
        <NavLink href="/tools" label="Tools" isActive={active === "tools"} />
      </nav>

      <div className="flex items-center gap-3">
        {/* Theme picker */}
        <ThemePicker />

        {/* CTA */}
        <Link
          href="/tools"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: "var(--color-brand)" }}
        >
          Launch Tools <Icon name="arrow-right" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
