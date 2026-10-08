import type { Metadata } from "next";
import { AuthEntrySigningContainer } from "@/components/demos/AuthEntrySigningContainer";

export const metadata: Metadata = {
  title: "Sign Auth Entry | Para Stellar SDK",
  description: "Sign Soroban authorization entries with a Para Stellar signer.",
};

export default function SignAuthEntryPage() {
  return <AuthEntrySigningContainer />;
}
