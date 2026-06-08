import type { Metadata } from "next";
import TypedDataSigningDemo from "@/components/demos/TypedDataSigningDemo";

export const metadata: Metadata = {
  title: "Typed Data Signing | Para Viem v2 Signer",
  description: "Sign EIP-712 typed data with a Para Viem v2 wallet client.",
};

export default function TypedDataSigningPage() {
  return <TypedDataSigningDemo />;
}
