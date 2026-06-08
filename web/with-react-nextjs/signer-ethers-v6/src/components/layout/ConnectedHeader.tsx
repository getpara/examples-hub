"use client";

import { usePathname } from "next/navigation";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { Header } from "./Header";

export function ConnectedHeader() {
  const pathname = usePathname();
  const wallet = useEvmWalletConnection();

  return (
    <Header
      address={wallet.address}
      isConnected={wallet.isConnected}
      onConnect={wallet.openModal}
      showBackLink={pathname !== "/"}
    />
  );
}
