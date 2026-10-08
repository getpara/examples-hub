import type { Metadata } from "next";
import { TokenTransferContainer } from "@/components/demos/TokenTransferContainer";

export const metadata: Metadata = {
  title: "Token Transfer | Para Ethers v5 Signer",
  description: "Transfer ERC20 tokens with a Para Ethers v5 signer.",
};

export default function TokenTransferPage() {
  return <TokenTransferContainer />;
}
