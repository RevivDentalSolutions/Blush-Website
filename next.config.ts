import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep route URLs aligned with the no-trailing-slash sitemap and canonicals.
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
