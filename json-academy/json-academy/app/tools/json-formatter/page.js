import { getToolBySlug } from "@/lib/tools";
import FormatterWidget from "@/components/tools/FormatterWidget";

export async function generateMetadata() {
  const tool = getToolBySlug("json-formatter");
  const title = `${tool.title} — Free Online Tool`;
  return {
    title,
    description: tool.shortDesc,
    keywords: tool.keywords,
    alternates: { canonical: "/tools/json-formatter" },
    openGraph: {
      title: `${title} | JSON Academy`,
      description: tool.shortDesc,
      url: "https://www.jsonacademy.com/tools/json-formatter",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | JSON Academy`,
      description: tool.shortDesc,
    },
  };
}

export default function JsonFormatterPage() {
  const tool = getToolBySlug("json-formatter");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (runs in browser)",
    description: tool.shortDesc,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: "https://www.jsonacademy.com/tools/json-formatter",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/*
        FormatterWidget fills the full viewport on its own —
        it carries the top bar (logo, Home, Tools links, indent pills,
        status dot, Copy, Download) and the two editor panels.
        No Nav, no Footer, no page chrome.
      */}
      <FormatterWidget />
    </>
  );
}
