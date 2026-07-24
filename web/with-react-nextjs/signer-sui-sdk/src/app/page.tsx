import type { Metadata } from "next";
import { SuiSdkApp } from "@/components/SuiSdkApp";
import SuiSdkExampleSelector from "@/components/demos/SuiSdkExampleSelector";

export const metadata: Metadata = {
  title: "Para Sui SDK Example",
  description: "Explore Para signer flows for Sui messages, transactions, and native multisig.",
};

export default function Home() {
  return (
    <SuiSdkApp>
      <SuiSdkExampleSelector />
    </SuiSdkApp>
  );
}
