import type { Metadata } from "next";
import TypedDataSigningDemo from "@/components/demos/TypedDataSigningDemo";

export const metadata: Metadata = {
  title: "Typed Data Signing | Para Ethers v6 Signer",
  description: "Sign EIP-712 typed data with a Para Ethers v6 signer.",
};

export default function TypedDataSigningPage() {
  return <TypedDataSigningDemo />;
}
