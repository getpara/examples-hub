import type { Metadata } from "next";
import { SuiSdkApp } from "@/components/SuiSdkApp";
import SuiTransferDemo from "@/components/demos/SuiTransferDemo";

export const metadata: Metadata = {
  title: "SUI Transfer | Para Sui SDK",
  description: "Send Sui Testnet SUI with a Para Sui transaction signer.",
};

export default function SignTransactionPage() {
  return (
    <SuiSdkApp>
      <SuiTransferDemo />
    </SuiSdkApp>
  );
}
