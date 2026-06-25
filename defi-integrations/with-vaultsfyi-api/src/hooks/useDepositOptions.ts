import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/vaultsFyi";

export type VaultOption = Awaited<
  ReturnType<typeof sdk.getAllVaults>
>["data"][number];

/**
 * Top USDC vaults on Base, ranked by 7-day APY, excluding any with multi-step
 * "complex" deposit/redeem flows for the first-deposit demo. Uses
 * `/v2/detailed-vaults` so it works pre-login (no user address required).
 *
 * For personalized recommendations once the user holds assets, switch to
 * `sdk.getBestDepositOptions({ path: { userAddress } })` which calls
 * `/v2/portfolio/best-deposit-options/:userAddress`.
 *
 * NOTE: defaults that bite — `allowedNetworks` defaults to 4 networks (will
 * silently miss most chains), `minTvl` defaults to 100,000, `sortOrder`
 * defaults to `asc`. Always pass these explicitly.
 * Reference: https://docs.vaults.fyi/resources/api-reference
 */
export function useDepositOptions() {
  return useQuery({
    queryKey: ["depositOptions"],
    queryFn: async () => {
      const result = await sdk.getAllVaults({
        query: {
          allowedAssets: ["USDC"],
          allowedNetworks: ["base"],
          onlyTransactional: true,
          sortBy: "apy7day",
          sortOrder: "desc",
          perPage: 20,
        },
      });

      return result.data.filter(
        (v) =>
          v.transactionalProperties?.depositStepsType !== "complex" &&
          v.transactionalProperties?.redeemStepsType !== "complex",
      );
    },
  });
}
