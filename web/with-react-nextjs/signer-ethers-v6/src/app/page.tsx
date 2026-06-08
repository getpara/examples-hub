import type { Metadata } from "next";
import EthersV6ExampleSelector from "@/components/demos/EthersV6ExampleSelector";

export const metadata: Metadata = {
  title: "Para Ethers v6 Signer Example",
  description: "Explore Para signer flows for Ethers v6, ETH transfers, ERC20 tokens, contracts, and signatures.",
};

export default function Home() {
  return <EthersV6ExampleSelector />;
}
