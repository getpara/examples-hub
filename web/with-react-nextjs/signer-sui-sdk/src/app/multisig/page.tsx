import type { Metadata } from "next";
import { SuiSdkApp } from "@/components/SuiSdkApp";
import MultiSigDemo from "@/components/demos/MultiSigDemo";

export const metadata: Metadata = {
  title: "Native Multisig | Para Sui SDK",
  description: "Build a Sui multisig with a Para wallet member and combine partial signatures.",
};

export default function MultiSigPage() {
  return (
    <SuiSdkApp>
      <MultiSigDemo />
    </SuiSdkApp>
  );
}
