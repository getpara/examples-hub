import type { Metadata } from "next";
import { ContractInteractionContainer } from "@/components/demos/ContractInteractionContainer";

export const metadata: Metadata = {
  title: "Contract Interaction | Para Viem v2 Signer",
  description: "Read and write a sample ERC20 contract with a Para Viem v2 wallet client.",
};

export default function ContractInteractionPage() {
  return <ContractInteractionContainer />;
}
