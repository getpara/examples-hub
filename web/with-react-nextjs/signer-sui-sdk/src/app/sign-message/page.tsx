import type { Metadata } from "next";
import { SuiSdkApp } from "@/components/SuiSdkApp";
import SignMessageDemo from "@/components/demos/SignMessageDemo";

export const metadata: Metadata = {
  title: "Sign Message | Para Sui SDK",
  description: "Sign and verify personal messages with a Para Sui signer.",
};

export default function SignMessagePage() {
  return (
    <SuiSdkApp>
      <SignMessageDemo />
    </SuiSdkApp>
  );
}
