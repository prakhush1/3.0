import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolRail from "@/components/tools/ToolRail";
import { TOOLS, getToolBySlug } from "@/lib/tools";
import { WIDGETS } from "@/components/tools/registry";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.title} — JSON Academy`,
    description: tool.intro,
    openGraph: { title: `${tool.title} — JSON Academy`, description: tool.intro },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const related = TOOLS.filter((t) => t.slug !== slug).slice(0, 3);
  const Widget = WIDGETS[slug] ?? null;

  /* Full-bleed tools (e.g. formatter) take over below the Nav */
  const isFullBleed = !!Widget?.fullBleed;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    description: tool.intro,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  /* ── Full-bleed layout ── */
    if (isFullBleed) {
      return (
        <main className="flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

          <Widget />
        </main>
      );
    }

  /* ── Normal padded layout ── */
  return (
    <main className="overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <Nav active="tools" />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <div className="flex gap-5 items-start">
          <ToolRail activeSlug={tool.slug} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:hidden"
                  style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}>
                  <Icon name={tool.icon} className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{tool.tag}</p>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{tool.title}</h1>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--color-brand)" }}>{tool.sub}</p>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">{tool.intro}</p>

            {/* interactive widget */}
            <div className="mt-6">{Widget && <Widget />}</div>

            {/* features */}
            <div className="mt-16 grid gap-x-10 gap-y-10 sm:grid-cols-3">
              {tool.features.map((f) => (
                <div key={f.title}>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}>
                    <Icon name="check-circle" className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* faq */}
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-extrabold">Frequently asked questions</h2>
              <div className="mt-6 divide-y divide-gray-200 border-t border-gray-200">
                {tool.faqs.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#171717]">
                      {f.q}
                      <Icon name="arrow-right" className="w-4 h-4 shrink-0 text-gray-400 transition group-open:rotate-90" />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* related tools */}
            <div className="mt-16">
              <h2 className="text-2xl font-extrabold">Other tools</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {related.map((t) => (
                  <a key={t.slug} href={`/tools/${t.slug}`}
                    className="group rounded-2xl border p-6 transition hover:shadow-md"
                    style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)" }}>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "var(--color-brand-100)", color: "var(--color-brand)" }}>
                        <Icon name={t.icon} className="w-5 h-5" />
                      </div>
                      <Icon name="arrow-right" className="w-4 h-4 text-gray-300 transition group-hover:translate-x-0.5" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{t.shortDesc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-16" />
      <Footer />
    </main>
  );
}
