import type { Metadata } from "next";
import { MessageSigningContainer } from "@/components/demos/MessageSigningContainer";

export const metadata: Metadata = {
  title: "Message Signing | Para Solana Signers v2",
  description: "Sign and verify arbitrary messages with a Para Solana Signers v2 signer.",
};

export default function MessageSigningPage() {
  return <MessageSigningContainer />;
}
