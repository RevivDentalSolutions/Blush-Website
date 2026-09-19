export const dynamic = "force-static";

import type {MetadataRoute} from "next";
import {canonicalUrl} from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {userAgent: "*", allow: "/"},
    sitemap: `${canonicalUrl}/sitemap.xml`,
    host: canonicalUrl,
  };
}
