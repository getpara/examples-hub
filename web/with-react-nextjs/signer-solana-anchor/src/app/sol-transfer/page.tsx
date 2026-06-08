import type { Metadata } from "next";
import { SolanaAnchorApp } from "@/components/SolanaAnchorApp";
import { SolanaAnchorPreview } from "@/components/SolanaAnchorPreview";
import SolTransferDemo from "@/components/demos/SolTransferDemo";

export const metadata: Metadata = {
  title: "SOL Transfer | Para Solana Anchor Signer",
  description: "Send Solana Devnet SOL with a Para-backed Anchor provider.",
};

export default function SolTransferPage() {
  return (
    <>
      <SolanaAnchorPreview variant="sol-transfer" />
      <SolanaAnchorApp>
        <SolTransferDemo />
      </SolanaAnchorApp>
    </>
  );
}
