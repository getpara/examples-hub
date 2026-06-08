"use client";

import { usePathname } from "next/navigation";
import { useCosmosWalletConnection } from "@/hooks/useCosmosWalletConnection";
import { Header } from "./Header";

export function ConnectedHeader() {
  const pathname = usePathname();
  const wallet = useCosmosWalletConnection();

  return (
    <Header
      address={wallet.address}
      isConnected={wallet.isConnected}
      onConnect={wallet.openModal}
      showBackLink={pathname !== "/"}
    />
  );
}
