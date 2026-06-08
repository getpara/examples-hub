import type { Metadata } from "next";
import ContractInteractionDemo from "@/components/demos/ContractInteractionDemo";

export const metadata: Metadata = {
  title: "Contract Interaction | Para Viem v2 Signer",
  description: "Read and write a sample ERC20 contract with a Para Viem v2 wallet client.",
};

export default function ContractInteractionPage() {
  return <ContractInteractionDemo />;
}
