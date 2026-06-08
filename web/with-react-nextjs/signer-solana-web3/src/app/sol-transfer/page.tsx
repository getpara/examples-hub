import type { Metadata } from "next";
import { SolanaWeb3App } from "@/components/SolanaWeb3App";
import { SolanaWeb3Preview } from "@/components/SolanaWeb3Preview";
import SolTransferDemo from "@/components/demos/SolTransferDemo";

export const metadata: Metadata = {
  title: "SOL Transfer | Para Solana web3.js",
  description: "Send Solana Devnet SOL with a Para web3.js transaction signer.",
};

export default function SolTransferPage() {
  return (
    <>
      <SolanaWeb3Preview variant="sol-transfer" />
      <SolanaWeb3App>
        <SolTransferDemo />
      </SolanaWeb3App>
    </>
  );
}
