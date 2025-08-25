import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      graz: "@getpara/graz",
    };
    return config;
  },
};

export default nextConfig;
