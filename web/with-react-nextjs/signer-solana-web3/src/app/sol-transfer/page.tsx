import type { Metadata } from "next";
import { SolTransferContainer } from "@/components/demos/SolTransferContainer";

export const metadata: Metadata = {
  title: "SOL Transfer | Para Solana web3.js Signer",
  description: "Send Solana Devnet SOL with a Para web3.js transaction signer.",
};

export default function SolTransferPage() {
  return <SolTransferContainer />;
}
