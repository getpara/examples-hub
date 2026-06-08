import type { Metadata } from "next";
import { SolanaSignersV2App } from "@/components/SolanaSignersV2App";
import { SolanaSignersV2Preview } from "@/components/SolanaSignersV2Preview";
import MessageSigningDemo from "@/components/demos/MessageSigningDemo";

export const metadata: Metadata = {
  title: "Message Signing | Para Solana Signers v2",
  description: "Sign and verify arbitrary messages with a Para Solana Signers v2 signer.",
};

export default function MessageSigningPage() {
  return (
    <>
      <SolanaSignersV2Preview variant="message-signing" />
      <SolanaSignersV2App>
        <MessageSigningDemo />
      </SolanaSignersV2App>
    </>
  );
}
