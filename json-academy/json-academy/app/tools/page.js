import ToolsClient from "./ToolsClient";

export const metadata = {
  title: "All JSON Tools",
  description:
    "Browse all free, privacy-first JSON tools: formatter, validator, minifier, CSV converter, tree viewer, diff checker, and path extractor.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return <ToolsClient />;
}
