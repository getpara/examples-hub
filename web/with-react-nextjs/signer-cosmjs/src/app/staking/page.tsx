import type { Metadata } from "next";
import StakingDemo from "@/components/demos/StakingDemo";

export const metadata: Metadata = {
  title: "Staking And Delegation | Para CosmJS Signer",
  description: "Delegate ATOM to validators with a Para Cosmos signer and CosmJS.",
};

export default function StakingPage() {
  return <StakingDemo />;
}
