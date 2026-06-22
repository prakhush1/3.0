import { getToolBySlug } from "@/lib/tools";
import UnescapeWidget from "@/components/tools/UnescapeWidget";

export async function generateMetadata() {
  const tool = getToolBySlug("json-unescape");
  const title = `${tool.title} — Free Online Tool`;
  return {
    title,
    description: tool.shortDesc,
    keywords: tool.keywords,
    alternates: { canonical: "/tools/json-unescape" },
    openGraph: { title: `${title} | JSON Academy`, description: tool.shortDesc, url: `https://www.jsonacademy.com/tools/json-unescape`, type: "website" },
    twitter: { card: "summary", title: `${title} | JSON Academy`, description: tool.shortDesc },
  };
}

export default function Page() {
  const tool = getToolBySlug("json-unescape");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (runs in browser)",
    description: tool.shortDesc,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `https://www.jsonacademy.com/tools/json-unescape`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UnescapeWidget />
    </>
  );
}
