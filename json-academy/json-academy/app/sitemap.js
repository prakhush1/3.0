import { TOOLS } from "@/lib/tools";

const BASE_URL = "https://www.jsonacademy.com";

export default function sitemap() {
  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 }
  ];

  const toolRoutes = TOOLS.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const lastModified = new Date();

  return [...staticRoutes, ...toolRoutes].map((route) => ({
    ...route,
    lastModified,
  }));
}
