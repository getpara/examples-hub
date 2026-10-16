"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Button } from "@/components/ui/Button";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { ARC, BASE, ROUTE } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";

const BridgeWorkspace = dynamic(
  () => import("@/components/BridgeWorkspace").then((workspaceModule) => workspaceModule.BridgeWorkspace),
  { ssr: false }
);

export function BridgeExample() {
  const wallet = useParaModalWallet();

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={wallet.address}
      onConnect={wallet.openModal}
      onOpenAccount={wallet.openModal}
    />
  );

  const footer = (
    <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} note="Mainnet. Real USDC moves." />
  );

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          description={`Connect to bridge USDC from ${BASE.name} to ${ARC.name}. Your wallet is created the first time you sign in.`}
          network={ROUTE.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  return (
    <AppShell header={header} footer={footer}>
      <BridgeWorkspace address={wallet.address} />
    </AppShell>
  );
}
