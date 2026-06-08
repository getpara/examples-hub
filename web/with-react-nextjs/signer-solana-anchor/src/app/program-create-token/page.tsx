import type { Metadata } from "next";
import { SolanaAnchorApp } from "@/components/SolanaAnchorApp";
import { SolanaAnchorPreview } from "@/components/SolanaAnchorPreview";
import ProgramCreateTokenDemo from "@/components/demos/ProgramCreateTokenDemo";

export const metadata: Metadata = {
  title: "Create Token | Para Solana Anchor Signer",
  description: "Create a Solana Token-2022 mint through an Anchor program with Para as the signer.",
};

export default function ProgramCreateTokenPage() {
  return (
    <>
      <SolanaAnchorPreview variant="program-create-token" />
      <SolanaAnchorApp>
        <ProgramCreateTokenDemo />
      </SolanaAnchorApp>
    </>
  );
}
