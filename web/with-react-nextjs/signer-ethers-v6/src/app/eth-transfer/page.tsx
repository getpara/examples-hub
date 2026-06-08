import type { Metadata } from "next";
import EthTransferDemo from "@/components/demos/EthTransferDemo";

export const metadata: Metadata = {
  title: "ETH Transfer | Para Ethers v6 Signer",
  description: "Send ETH on Holesky using a Para Ethers v6 signer.",
};

export default function EthTransferPage() {
  return <EthTransferDemo />;
}
