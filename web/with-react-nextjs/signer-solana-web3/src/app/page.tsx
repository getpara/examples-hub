import type { Metadata } from "next";
import { SolanaWeb3App } from "@/components/SolanaWeb3App";
import { SolanaWeb3Preview } from "@/components/SolanaWeb3Preview";
import SolanaWeb3ExampleSelector from "@/components/demos/SolanaWeb3ExampleSelector";

export const metadata: Metadata = {
  title: "Para Solana web3.js Example",
  description: "Explore Para signer flows for Solana web3.js messages and SOL transfers.",
};

export default function Home() {
  return (
    <>
      <SolanaWeb3Preview variant="selector" />
      <SolanaWeb3App>
        <SolanaWeb3ExampleSelector />
      </SolanaWeb3App>
    </>
  );
}
