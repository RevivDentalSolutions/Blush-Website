export const dynamic = "force-static";

import type {MetadataRoute} from "next";
import {canonicalUrl, services} from "@/data/site";

const indexablePaths = Array.from(new Set([
  "",
  "/permanent-makeup",
  "/powder-brows",
  "/lip-blushing",
  "/permanent-eyeliner",
  "/corrections",
  "/portfolio",
  "/about",
  "/faqs",
  "/contact",
  "/book-now",
  "/touch-ups",
  "/blog",
  ...services
    .filter((service) => !["powder-brows", "lip-blushing", "permanent-eyeliner"].includes(service.slug))
    .map((service) => `/${service.slug}`),
]));

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePaths.map((path) => ({
    url: path ? `${canonicalUrl}${path}` : `${canonicalUrl}/`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
