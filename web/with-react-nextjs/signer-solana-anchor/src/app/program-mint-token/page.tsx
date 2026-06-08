import type { Metadata } from "next";
import { SolanaAnchorApp } from "@/components/SolanaAnchorApp";
import { SolanaAnchorPreview } from "@/components/SolanaAnchorPreview";
import ProgramMintTokenDemo from "@/components/demos/ProgramMintTokenDemo";

export const metadata: Metadata = {
  title: "Mint Token | Para Solana Anchor Signer",
  description: "Mint Solana Token-2022 assets through an Anchor program with Para as the signer.",
};

export default function ProgramMintTokenPage() {
  return (
    <>
      <SolanaAnchorPreview variant="program-mint-token" />
      <SolanaAnchorApp>
        <ProgramMintTokenDemo />
      </SolanaAnchorApp>
    </>
  );
}
