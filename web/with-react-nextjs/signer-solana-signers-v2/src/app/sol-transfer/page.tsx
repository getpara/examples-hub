import type { Metadata } from "next";
import { SolTransferContainer } from "@/components/demos/SolTransferContainer";

export const metadata: Metadata = {
  title: "SOL Transfer | Para Solana Signers v2",
  description: "Send Solana Devnet SOL with a Para Signers v2 transaction signer.",
};

export default function SolTransferPage() {
  return <SolTransferContainer />;
}
