import type { Metadata } from "next";
import { MintTokenContainer } from "@/components/demos/MintTokenContainer";

export const metadata: Metadata = {
  title: "Mint Token | Para Solana Anchor Signer",
  description: "Mint Solana Token-2022 assets through an Anchor program with Para as the signer.",
};

export default function ProgramMintTokenPage() {
  return <MintTokenContainer />;
}
