import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TOOLS, getToolBySlug } from "@/lib/tools";
import { WIDGETS } from "@/components/tools/registry";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const title = `${tool.title} — Free Online Tool`;
  return {
    title,
    description: tool.shortDesc,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title: `${title} | JSON Academy`,
      description: tool.shortDesc,
      url: `https://www.jsonacademy.com/tools/${tool.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | JSON Academy`,
      description: tool.shortDesc,
    },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const Widget = WIDGETS[tool.slug];
  const related = TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (runs in browser)",
    description: tool.shortDesc,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `https://www.jsonacademy.com/tools/${tool.slug}`,
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

  return (
    <main className="overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <Nav active="tools" />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <a href="/" className="hover:text-violet-500">Home</a> /
          <a href="/tools" className="hover:text-violet-500">Tools</a> /
          <span className="text-gray-600">{tool.title}</span>
        </nav>

        <div className="mt-5 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Icon name={tool.icon} className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400">{tool.tag}</p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tool.title}</h1>
            <p className="mt-0.5 text-sm font-medium text-violet-500">{tool.sub}</p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-500">{tool.intro}</p>

        {/* interactive widget */}
        <div className="mt-8">{Widget && <Widget />}</div>

        {/* features */}
        <div className="mt-16 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {tool.features.map((f) => (
            <div key={f.title}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
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
              <a key={t.slug} href={`/tools/${t.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-violet-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Icon name={t.icon} className="w-5 h-5" />
                  </div>
                  <Icon name="arrow-right" className="w-4 h-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{t.shortDesc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="h-16" />
      <Footer />
    </main>
  );
}
