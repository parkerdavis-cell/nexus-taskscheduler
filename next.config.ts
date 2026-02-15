import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["node-ical", "node-pty"],
  images: { unoptimized: true },
};

export default nextConfig;
