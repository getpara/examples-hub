"use client";

import { usePathname } from "next/navigation";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";
import { Header } from "./Header";

export function ConnectedHeader() {
  const pathname = usePathname();
  const wallet = useSolanaWalletConnection();

  return (
    <Header
      address={wallet.address}
      isConnected={wallet.isConnected}
      onConnect={wallet.openModal}
      showBackLink={pathname !== "/"}
    />
  );
}
