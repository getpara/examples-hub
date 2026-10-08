import type { Metadata } from "next";
import { MultiSigContainer } from "@/components/demos/MultiSigContainer";

export const metadata: Metadata = {
  title: "Native Multisig | Para Sui SDK Signer",
  description: "Build a Sui multisig with a Para wallet member and combine partial signatures.",
};

export default function MultiSigPage() {
  return <MultiSigContainer />;
}
