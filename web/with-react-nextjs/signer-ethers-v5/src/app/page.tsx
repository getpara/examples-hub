import type { Metadata } from "next";
import EthersV5ExampleSelector from "@/components/demos/EthersV5ExampleSelector";

export const metadata: Metadata = {
  title: "Para Ethers v5 Signer Example",
  description: "Explore Para signer flows for Ethers v5, ETH transfers, ERC20 tokens, contracts, and signatures.",
};

export default function Home() {
  return <EthersV5ExampleSelector />;
}
