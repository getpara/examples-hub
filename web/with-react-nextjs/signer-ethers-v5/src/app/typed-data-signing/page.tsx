import type { Metadata } from "next";
import { TypedDataSigningContainer } from "@/components/demos/TypedDataSigningContainer";

export const metadata: Metadata = {
  title: "Typed Data Signing | Para Ethers v5 Signer",
  description: "Sign EIP-712 typed data with a Para Ethers v5 signer.",
};

export default function TypedDataSigningPage() {
  return <TypedDataSigningContainer />;
}
