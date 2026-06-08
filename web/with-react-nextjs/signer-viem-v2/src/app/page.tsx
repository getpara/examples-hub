import type { Metadata } from "next";
import ViemV2ExampleSelector from "@/components/demos/ViemV2ExampleSelector";

export const metadata: Metadata = {
  title: "Para Viem v2 Signer Example",
  description: "Explore Para signer flows for Viem v2, ETH transfers, ERC20 tokens, contracts, and signatures.",
};

export default function Home() {
  return <ViemV2ExampleSelector />;
}
