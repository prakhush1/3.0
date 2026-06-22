import Link from "next/link";
import Icon from "@/components/Icon";
import { TOOLS } from "@/lib/tools";

export default function ToolRail({ activeSlug }) {
  return (
    <nav
      aria-label="Switch tool"
      className="sticky top-24 hidden h-fit w-14 shrink-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-2 sm:flex"
    >
      {TOOLS.map((t) => {
        const isActive = t.slug === activeSlug;
        return (
          <Link
            key={t.slug}
            href={`/tools/${t.slug}`}
            title={t.title}
            aria-label={t.title}
            aria-current={isActive ? "page" : undefined}
            className={
              "flex h-10 w-10 items-center justify-center rounded-xl transition " +
              (isActive
                ? "bg-violet-500 text-white"
                : "text-gray-400 hover:bg-violet-50 hover:text-violet-500")
            }
          >
            <Icon name={t.icon} className="w-5 h-5" />
          </Link>
        );
      })}
    </nav>
  );
}
