import type { Metadata } from "next";
import ContractInteractionDemo from "@/components/demos/ContractInteractionDemo";

export const metadata: Metadata = {
  title: "Contract Interaction | Para Ethers v5 Signer",
  description: "Read and write a sample ERC20 contract with a Para Ethers v5 signer.",
};

export default function ContractInteractionPage() {
  return <ContractInteractionDemo />;
}
