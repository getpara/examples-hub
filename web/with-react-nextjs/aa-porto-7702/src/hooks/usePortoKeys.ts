import { useEffect, useState } from "react";
import { Account, RelayActions, type Key } from "porto/viem";
import type { Address } from "viem";
import { portoClient } from "@/lib/porto";

interface KeysResult {
  address: Address;
  isUpgraded: boolean;
  keys: readonly Key.Key[];
}

export function usePortoKeys(address: Address | null, isUpgraded: boolean) {
  const [result, setResult] = useState<KeysResult | null>(null);

  useEffect(() => {
    if (!address) {
      return;
    }

    let isCurrent = true;

    RelayActions.getKeys(portoClient, { account: Account.from({ address }) })
      .then((keys) => {
        if (isCurrent) setResult({ address, isUpgraded, keys });
      })
      .catch(() => {
        if (isCurrent) setResult({ address, isUpgraded, keys: [] });
      });

    return () => {
      isCurrent = false;
    };
  }, [address, isUpgraded]);

  const currentResult = result && result.address === address && result.isUpgraded === isUpgraded ? result : null;

  return {
    keys: currentResult?.keys ?? [],
    isChecking: address !== null && !currentResult,
  };
}
