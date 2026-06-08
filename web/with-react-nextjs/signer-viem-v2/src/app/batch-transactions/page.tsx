import type { Metadata } from "next";
import BatchTransactionsDemo from "@/components/demos/BatchTransactionsDemo";

export const metadata: Metadata = {
  title: "Batch Transactions | Para Viem v2 Signer",
  description: "Encode multiple ERC20 operations and submit them with a Para Viem v2 wallet client.",
};

export default function BatchTransactionsPage() {
  return <BatchTransactionsDemo />;
}
