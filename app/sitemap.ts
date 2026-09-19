export const dynamic = "force-static";

import type {MetadataRoute} from "next";
import {canonicalUrl, services} from "@/data/site";

const indexablePaths = [
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
  "/blog",
  ...services
    .filter((service) => !["powder-brows", "lip-blushing", "permanent-eyeliner"].includes(service.slug))
    .map((service) => `/${service.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePaths.map((path) => ({
    url: `${canonicalUrl}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
