import type { Metadata } from "next";
import { StellarSdkApp } from "@/components/StellarSdkApp";
import SignAuthEntryDemo from "@/components/demos/SignAuthEntryDemo";

export const metadata: Metadata = {
  title: "Sign Auth Entry | Para Stellar SDK",
  description: "Sign Soroban authorization entries with a Para Stellar signer.",
};

export default function SignAuthEntryPage() {
  return (
    <StellarSdkApp>
      <SignAuthEntryDemo />
    </StellarSdkApp>
  );
}
