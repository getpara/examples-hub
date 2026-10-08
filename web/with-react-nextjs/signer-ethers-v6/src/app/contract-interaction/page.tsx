import type { Metadata } from "next";
import { ContractInteractionContainer } from "@/components/demos/ContractInteractionContainer";

export const metadata: Metadata = {
  title: "Contract Interaction | Para Ethers v6 Signer",
  description: "Read and write a sample ERC20 contract with a Para Ethers v6 signer.",
};

export default function ContractInteractionPage() {
  return <ContractInteractionContainer />;
}
