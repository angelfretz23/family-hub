import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
