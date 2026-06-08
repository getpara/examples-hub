import type { Metadata } from "next";
import { SolanaSignersV2App } from "@/components/SolanaSignersV2App";
import { SolanaSignersV2Preview } from "@/components/SolanaSignersV2Preview";
import SolTransferDemo from "@/components/demos/SolTransferDemo";

export const metadata: Metadata = {
  title: "SOL Transfer | Para Solana Signers v2",
  description: "Send Solana Devnet SOL with a Para Signers v2 transaction signer.",
};

export default function SolTransferPage() {
  return (
    <>
      <SolanaSignersV2Preview variant="sol-transfer" />
      <SolanaSignersV2App>
        <SolTransferDemo />
      </SolanaSignersV2App>
    </>
  );
}
