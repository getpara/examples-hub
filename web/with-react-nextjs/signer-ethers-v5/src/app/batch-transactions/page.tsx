import type { Metadata } from "next";
import { BatchTransactionsContainer } from "@/components/demos/BatchTransactionsContainer";

export const metadata: Metadata = {
  title: "Batch Transactions | Para Ethers v5 Signer",
  description: "Encode multiple ERC20 operations and submit them with a Para Ethers v5 signer.",
};

export default function BatchTransactionsPage() {
  return <BatchTransactionsContainer />;
}
