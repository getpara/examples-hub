import type { Metadata } from "next";
import { StakingContainer } from "@/components/demos/StakingContainer";

export const metadata: Metadata = {
  title: "Staking And Delegation | Para CosmJS Signer",
  description: "Delegate ATOM to validators with a Para Cosmos signer and CosmJS.",
};

export default function StakingPage() {
  return <StakingContainer />;
}
