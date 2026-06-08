import type { Metadata } from "next";
import ContractDeploymentDemo from "@/components/demos/ContractDeploymentDemo";

export const metadata: Metadata = {
  title: "Contract Deployment | Para Viem v2 Signer",
  description: "Deploy a sample ERC20 contract with a Para Viem v2 wallet client.",
};

export default function ContractDeploymentPage() {
  return <ContractDeploymentDemo />;
}
