import type { Metadata } from "next";
import { ContractDeploymentContainer } from "@/components/demos/ContractDeploymentContainer";

export const metadata: Metadata = {
  title: "Contract Deployment | Para Ethers v5 Signer",
  description: "Deploy a sample ERC20 contract with a Para Ethers v5 signer.",
};

export default function ContractDeploymentPage() {
  return <ContractDeploymentContainer />;
}
