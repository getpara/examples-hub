import type { Metadata } from "next";
import { StellarSdkApp } from "@/components/StellarSdkApp";
import SignMessageDemo from "@/components/demos/SignMessageDemo";

export const metadata: Metadata = {
  title: "Sign Message | Para Stellar SDK",
  description: "Sign and verify arbitrary messages with a Para Stellar signer.",
};

export default function SignMessagePage() {
  return (
    <StellarSdkApp>
      <SignMessageDemo />
    </StellarSdkApp>
  );
}
