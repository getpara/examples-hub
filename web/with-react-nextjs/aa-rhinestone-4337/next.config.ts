import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@getpara/web-sdk", "@getpara/react-sdk", "@rhinestone/sdk"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Fix viem module resolution for Rhinestone SDK
    const viemPath = path.dirname(require.resolve('viem/package.json'));
    config.resolve.alias = {
      ...config.resolve.alias,
      'viem': viemPath,
      'viem/chains': path.join(viemPath, '_esm/chains/index.js'),
      'viem/utils': path.join(viemPath, '_esm/utils/index.js'),
      'viem/actions': path.join(viemPath, '_esm/actions/index.js'),
      'viem/account-abstraction': path.join(viemPath, '_esm/account-abstraction/index.js'),
    };

    return config;
  },
};

export default nextConfig;