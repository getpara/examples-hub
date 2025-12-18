import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@getpara/web-sdk", "@getpara/react-sdk"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Fix viem module resolution for Rhinestone SDK
    config.resolve.alias = {
      ...config.resolve.alias,
      'viem': require.resolve('viem'),
      'viem/chains': require.resolve('viem/chains'),
      'viem/utils': require.resolve('viem/utils'),
      'viem/actions': require.resolve('viem/actions'),
      'viem/account-abstraction': require.resolve('viem/account-abstraction'),
    };
    
    return config;
  },
};

export default nextConfig;