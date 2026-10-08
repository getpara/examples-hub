import type { Metadata } from "next";
import { SignMessageContainer } from "@/components/demos/SignMessageContainer";

export const metadata: Metadata = {
  title: "Sign Message | Para Sui SDK Signer",
  description: "Sign and verify personal messages with a Para Sui signer.",
};

export default function SignMessagePage() {
  return <SignMessageContainer />;
}
