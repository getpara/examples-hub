"use client";

import { usePathname } from "next/navigation";
import { useSuiWalletConnection } from "@/hooks/useSuiWalletConnection";
import { Header } from "./Header";

export function ConnectedHeader() {
  const pathname = usePathname();
  const wallet = useSuiWalletConnection();

  return (
    <Header
      address={wallet.address}
      isConnected={wallet.isConnected}
      onConnect={wallet.openModal}
      showBackLink={pathname !== "/"}
    />
  );
}
