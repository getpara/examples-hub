import type { Metadata } from "next";
import CosmjsExampleSelector from "@/components/demos/CosmjsExampleSelector";

export const metadata: Metadata = {
  title: "Para CosmJS Signer Example",
  description: "Explore Para signer flows for CosmJS, Cosmos transactions, staking, governance, and CosmWasm.",
};

export default function Home() {
  return <CosmjsExampleSelector />;
}
