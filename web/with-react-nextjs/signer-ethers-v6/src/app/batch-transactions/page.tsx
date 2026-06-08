import type { Metadata } from "next";
import BatchTransactionsDemo from "@/components/demos/BatchTransactionsDemo";

export const metadata: Metadata = {
  title: "Batch Transactions | Para Ethers v6 Signer",
  description: "Encode multiple ERC20 operations and submit them with a Para Ethers v6 signer.",
};

export default function BatchTransactionsPage() {
  return <BatchTransactionsDemo />;
}
