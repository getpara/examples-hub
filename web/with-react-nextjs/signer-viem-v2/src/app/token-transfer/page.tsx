import type { Metadata } from "next";
import { TokenTransferContainer } from "@/components/demos/TokenTransferContainer";

export const metadata: Metadata = {
  title: "Token Transfer | Para Viem v2 Signer",
  description: "Transfer ERC20 tokens with a Para Viem v2 wallet client.",
};

export default function TokenTransferPage() {
  return <TokenTransferContainer />;
}
