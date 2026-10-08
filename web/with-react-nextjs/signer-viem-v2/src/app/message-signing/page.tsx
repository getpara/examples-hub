import type { Metadata } from "next";
import { MessageSigningContainer } from "@/components/demos/MessageSigningContainer";

export const metadata: Metadata = {
  title: "Message Signing | Para Viem v2 Signer",
  description: "Sign and verify arbitrary messages with a Para Viem v2 wallet client.",
};

export default function MessageSigningPage() {
  return <MessageSigningContainer />;
}
