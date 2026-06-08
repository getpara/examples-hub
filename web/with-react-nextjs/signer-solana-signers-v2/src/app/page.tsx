import type { Metadata } from "next";
import { SolanaSignersV2App } from "@/components/SolanaSignersV2App";
import { SolanaSignersV2Preview } from "@/components/SolanaSignersV2Preview";
import SolanaSignersV2ExampleSelector from "@/components/demos/SolanaSignersV2ExampleSelector";

export const metadata: Metadata = {
  title: "Para Solana Signers v2 Example",
  description: "Explore Para signer flows for Solana messages and SOL transfers.",
};

export default function Home() {
  return (
    <>
      <SolanaSignersV2Preview variant="selector" />
      <SolanaSignersV2App>
        <SolanaSignersV2ExampleSelector />
      </SolanaSignersV2App>
    </>
  );
}
