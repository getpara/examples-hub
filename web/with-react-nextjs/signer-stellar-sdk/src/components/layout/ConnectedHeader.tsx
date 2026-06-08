"use client";

import { usePathname } from "next/navigation";
import { useStellarWalletConnection } from "@/hooks/useStellarWalletConnection";
import { Header } from "./Header";

export function ConnectedHeader() {
  const pathname = usePathname();
  const wallet = useStellarWalletConnection();

  return (
    <Header
      address={wallet.address}
      isConnected={wallet.isConnected}
      onConnect={wallet.openModal}
      showBackLink={pathname !== "/"}
    />
  );
}
