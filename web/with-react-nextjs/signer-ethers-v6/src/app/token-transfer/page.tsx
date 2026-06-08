import type { Metadata } from "next";
import TokenTransferDemo from "@/components/demos/TokenTransferDemo";

export const metadata: Metadata = {
  title: "Token Transfer | Para Ethers v6 Signer",
  description: "Transfer ERC20 tokens with a Para Ethers v6 signer.",
};

export default function TokenTransferPage() {
  return <TokenTransferDemo />;
}
