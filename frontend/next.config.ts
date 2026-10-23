import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  experimental: {
    // Match Spring's 26 MiB total request limit (five 5 MiB files + headers).
    proxyClientMaxBodySize: "26mb",
  },
  async rewrites() {
    // These destinations are baked into the standalone build, not browser code.
    const backend = process.env.INTERNAL_API_BASE_URL?.replace(/\/$/, "");
    if (!backend) return [];
    return [
      { source: "/api/:path*", destination: `${backend}/:path*` },
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
