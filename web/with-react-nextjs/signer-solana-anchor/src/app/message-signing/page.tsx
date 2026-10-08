import type { Metadata } from "next";
import { MessageSigningContainer } from "@/components/demos/MessageSigningContainer";

export const metadata: Metadata = {
  title: "Message Signing | Para Solana Anchor Signer",
  description: "Sign and verify arbitrary messages with a Para Solana web3.js signer.",
};

export default function MessageSigningPage() {
  return <MessageSigningContainer />;
}
