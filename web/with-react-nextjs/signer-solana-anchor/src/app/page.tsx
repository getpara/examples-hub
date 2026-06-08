import type { Metadata } from "next";
import { SolanaAnchorApp } from "@/components/SolanaAnchorApp";
import { SolanaAnchorPreview } from "@/components/SolanaAnchorPreview";
import SolanaAnchorExampleSelector from "@/components/demos/SolanaAnchorExampleSelector";

export const metadata: Metadata = {
  title: "Para Solana Anchor Signer Example",
  description: "Explore Para signer flows for Solana messages, SOL transfers, and Anchor program calls.",
};

export default function Home() {
  return (
    <>
      <SolanaAnchorPreview variant="selector" />
      <SolanaAnchorApp>
        <SolanaAnchorExampleSelector />
      </SolanaAnchorApp>
    </>
  );
}
