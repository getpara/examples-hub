import type { Metadata } from "next";
import { GovernanceContainer } from "@/components/demos/GovernanceContainer";

export const metadata: Metadata = {
  title: "Governance Voting | Para CosmJS Signer",
  description: "Vote on Cosmos governance proposals with a Para Cosmos signer.",
};

export default function GovernancePage() {
  return <GovernanceContainer />;
}
