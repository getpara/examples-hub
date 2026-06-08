import type { Metadata } from "next";
import GovernanceDemo from "@/components/demos/GovernanceDemo";

export const metadata: Metadata = {
  title: "Governance Voting | Para CosmJS Signer",
  description: "Vote on Cosmos governance proposals with a Para Cosmos signer.",
};

export default function GovernancePage() {
  return <GovernanceDemo />;
}
