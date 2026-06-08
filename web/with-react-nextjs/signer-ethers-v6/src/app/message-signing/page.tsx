import type { Metadata } from "next";
import MessageSigningDemo from "@/components/demos/MessageSigningDemo";

export const metadata: Metadata = {
  title: "Message Signing | Para Ethers v6 Signer",
  description: "Sign and verify arbitrary messages with a Para Ethers v6 signer.",
};

export default function MessageSigningPage() {
  return <MessageSigningDemo />;
}
