import type { FactRow } from "@/components/ui/Facts";
import type { StepDefinition } from "@/lib/useStepProgress";
import type { PregenWallet } from "@/lib/pregenWalletApi";

interface ClaimProgress {
  wallet: PregenWallet | null;
  isClaimed: boolean;
  isExportOpened: boolean;
}

interface WalletStateInput {
  wallet: PregenWallet | null;
  connectedAddress: string;
  isClaimed: boolean;
}

export function isSameAddress(expected: string, actual: string) {
  return Boolean(expected && actual) && expected.toLowerCase() === actual.toLowerCase();
}

export function getClaimSteps({ wallet, isClaimed, isExportOpened }: ClaimProgress): StepDefinition[] {
  return [
    { title: "Create pregen wallet", isComplete: wallet !== null },
    { title: "Claim with email", isComplete: isClaimed },
    { title: "Export key", isComplete: isClaimed && isExportOpened },
  ];
}

export function getClaimFacts(wallet: PregenWallet): FactRow[] {
  return [
    { label: "Claim email", value: wallet.email, testId: "claim-email-display" },
    {
      label: "Wallet address",
      value: wallet.walletAddress || "Pending address",
      tone: wallet.walletAddress ? "mono" : "muted",
      testId: "generated-wallet-address",
    },
  ];
}

export function getWalletStateFacts({ wallet, connectedAddress, isClaimed }: WalletStateInput): FactRow[] {
  return [
    wallet && !isClaimed
      ? { label: "UUID identifier", value: wallet.customId, tone: "mono", testId: "generated-custom-id" }
      : { label: "UUID identifier", value: wallet ? "Upgraded to email" : "Not created", tone: "muted" },
    wallet
      ? { label: "Wallet ID", value: wallet.walletId, tone: "mono", testId: "generated-wallet-id" }
      : { label: "Wallet ID", value: "Not created", tone: "muted" },
    {
      label: "Expected address",
      value: wallet?.walletAddress || "No pregen wallet",
      tone: wallet?.walletAddress ? "mono" : "muted",
      testId: "expected-wallet-address",
    },
    {
      label: "Connected address",
      value: connectedAddress || "Not connected",
      tone: connectedAddress ? "mono" : "muted",
      testId: "connected-wallet-address",
    },
    {
      label: "Claim email",
      value: wallet?.email || "Not set",
      tone: wallet ? "default" : "muted",
      testId: "claim-wallet-email",
    },
  ];
}
