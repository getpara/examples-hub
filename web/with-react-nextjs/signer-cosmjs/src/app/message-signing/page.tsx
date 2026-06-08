import type { Metadata } from "next";
import MessageSigningDemo from "@/components/demos/MessageSigningDemo";

export const metadata: Metadata = {
  title: "Message Signing | Para CosmJS Signer",
  description: "Sign a Cosmos message with a Para signer and CosmJS.",
};

export default function MessageSigningPage() {
  return <MessageSigningDemo />;
}
