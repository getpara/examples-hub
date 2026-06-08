"use client";

import { useAppKit, useAppKitAccount, useAppKitNetwork, useDisconnect } from "@reown/appkit/react";
import { formatUnits } from "viem";
import { useBalance } from "wagmi";
import { formatBalance } from "@/utils/format";

export function useReownAppKitWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  });

  const balance = balanceData
    ? `${formatBalance(formatUnits(balanceData.value, balanceData.decimals))} ${balanceData.symbol}`
    : "0";

  return {
    address,
    balance,
    disconnectWallet: disconnect,
    isConnected,
    networkName: caipNetwork?.name || "Unknown",
    openAppKit: open,
  };
}
