import type { Metadata } from "next";
import { SolTransferContainer } from "@/components/demos/SolTransferContainer";

export const metadata: Metadata = {
  title: "SOL Transfer | Para Solana Anchor Signer",
  description: "Send Solana Devnet SOL with a Para-backed Anchor provider.",
};

export default function SolTransferPage() {
  return <SolTransferContainer />;
}
