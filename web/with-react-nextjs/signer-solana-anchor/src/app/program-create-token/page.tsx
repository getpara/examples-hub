import type { Metadata } from "next";
import { CreateTokenContainer } from "@/components/demos/CreateTokenContainer";

export const metadata: Metadata = {
  title: "Create Token | Para Solana Anchor Signer",
  description: "Create a Solana Token-2022 mint through an Anchor program with Para as the signer.",
};

export default function ProgramCreateTokenPage() {
  return <CreateTokenContainer />;
}
