import type { Metadata } from "next";
import { SolanaAnchorApp } from "@/components/SolanaAnchorApp";
import { SolanaAnchorPreview } from "@/components/SolanaAnchorPreview";
import MessageSigningDemo from "@/components/demos/MessageSigningDemo";

export const metadata: Metadata = {
  title: "Message Signing | Para Solana Anchor Signer",
  description: "Sign and verify arbitrary messages with a Para Solana web3.js signer.",
};

export default function MessageSigningPage() {
  return (
    <>
      <SolanaAnchorPreview variant="message-signing" />
      <SolanaAnchorApp>
        <MessageSigningDemo />
      </SolanaAnchorApp>
    </>
  );
}
