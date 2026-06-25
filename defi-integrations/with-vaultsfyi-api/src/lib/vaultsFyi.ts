/**
 * Typed client for the vaults.fyi v2 API using the official SDK.
 *
 * The SDK is configured with `apiBaseUrl` pointing at the Next.js API proxy
 * (/api/vaultsfyi) which adds the x-api-key header server-side. The API key
 * never reaches the browser bundle.
 *
 * Spec: https://docs.vaults.fyi/sdk/reference
 */

import { VaultsSdk } from "@vaultsfyi/sdk";

export const sdk = new VaultsSdk(
  { apiKey: "proxied" },
  {
    apiBaseUrl:
      typeof window !== "undefined"
        ? `${window.location.origin}/api/vaultsfyi`
        : "/api/vaultsfyi",
  },
);
