import type { NextConfig } from "next";

/**
 * Para SDK 2.27.0 ships optional integrations (Stellar, MetaMask Delegation
 * Toolkit, etc.) whose peer dependencies are NOT installed by any of the
 * `defi-integrations/` peers in examples-hub. Without resolving them to empty
 * modules, `yarn dev` and `yarn build` both fail with module-not-found on
 * first compile — confirmed against Jupiter / Relay / Squid peers as of
 * 2026-05-25.
 *
 * The vaults.fyi recipe is EVM-only (viem + @getpara/viem-v2-integration), so
 * we never touch these integrations at runtime. The fallback config below
 * tells webpack to substitute empty modules and let the Para SDK's runtime
 * checks handle them as "integration unavailable."
 *
 * If Para upstreams a fix for tree-shaking these optional integrations, this
 * block becomes unnecessary.
 */
const PARA_SDK_OPTIONAL_DEPS = [
  "@stellar/stellar-sdk",
  "@metamask/delegation-toolkit",
  "ethers", // Para SDK ships ethers v5/v6 EVM signers alongside viem; this recipe uses viem only.
  "@getpara/ethers-v6-integration",
  "@farcaster/miniapp-wagmi-connector",
  "@farcaster/mini-app-solana",
  "@farcaster/miniapp-sdk",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      ...Object.fromEntries(PARA_SDK_OPTIONAL_DEPS.map((p) => [p, false])),
    };
    return config;
  },
};

export default nextConfig;
