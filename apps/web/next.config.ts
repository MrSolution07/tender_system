import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tender/shared", "@tender/ui"],
  agentRules: false,
};

export default nextConfig;
