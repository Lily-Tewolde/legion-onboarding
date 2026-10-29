import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop `next dev` from regenerating AGENTS.md
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  // No landing page: the flow starts at screen 1
  async redirects() {
    return [{ source: "/", destination: "/join", permanent: false }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
