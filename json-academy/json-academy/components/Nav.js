import Link from "next/link";
import Icon from "./Icon";

function NavLink({ href, label, isActive }) {
  const braceClass =
    "text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100";

  return (
    <Link
      href={href}
      className={
        "group relative flex items-center gap-1 pb-1.5 transition-colors " +
        (isActive ? "text-violet-500" : "text-gray-600 hover:text-violet-500")
      }
    >
      {!isActive && <span className={braceClass}>{"{"}</span>}
      <span>{label}</span>
      {!isActive && <span className={braceClass}>{"}"}</span>}
      <span
        className={
          "absolute -bottom-px left-0 h-0.5 bg-violet-500 transition-all duration-200 " +
          (isActive ? "w-full" : "w-0")
        }
      />
    </Link>
  );
}

export default function Nav({ active = "home" }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-white">
          <Icon name="code" className="w-4 h-4" />
        </span>
        <span className="text-base font-bold">
          <span className="text-violet-500">{"{JSON}"}</span> Academy
        </span>
      </Link>
      <nav className="hidden gap-8 text-sm font-medium md:flex">
        <NavLink href="/" label="Home" isActive={active === "home"} />
        <NavLink href="/tools" label="Tools" isActive={active === "tools"} />
      </nav>
      <Link href="/tools" className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600">
        Launch Tools <Icon name="arrow-right" className="w-3.5 h-3.5" />
      </Link>
    </header>
  );
}