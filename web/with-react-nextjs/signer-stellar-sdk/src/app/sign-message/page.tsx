import type { Metadata } from "next";
import { MessageSigningContainer } from "@/components/demos/MessageSigningContainer";

export const metadata: Metadata = {
  title: "Sign Message | Para Stellar SDK",
  description: "Sign and verify arbitrary messages with a Para Stellar signer.",
};

export default function SignMessagePage() {
  return <MessageSigningContainer />;
}
