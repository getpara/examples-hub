import type { Metadata } from "next";
import { MessageSigningContainer } from "@/components/demos/MessageSigningContainer";

export const metadata: Metadata = {
  title: "Message Signing | Para CosmJS Signer",
  description: "Sign a Cosmos message with a Para signer and CosmJS.",
};

export default function MessageSigningPage() {
  return <MessageSigningContainer />;
}
