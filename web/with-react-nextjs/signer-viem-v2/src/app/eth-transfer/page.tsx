import type { Metadata } from "next";
import EthTransferDemo from "@/components/demos/EthTransferDemo";

export const metadata: Metadata = {
  title: "ETH Transfer | Para Viem v2 Signer",
  description: "Send ETH on Holesky using a Para Viem v2 wallet client.",
};

export default function EthTransferPage() {
  return <EthTransferDemo />;
}
