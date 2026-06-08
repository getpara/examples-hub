import type { Metadata } from "next";
import { StellarSdkApp } from "@/components/StellarSdkApp";
import XlmTransferDemo from "@/components/demos/XlmTransferDemo";

export const metadata: Metadata = {
  title: "XLM Transfer | Para Stellar SDK",
  description: "Send Stellar Testnet XLM with a Para Stellar transaction signer.",
};

export default function SignTransactionPage() {
  return (
    <StellarSdkApp>
      <XlmTransferDemo />
    </StellarSdkApp>
  );
}
