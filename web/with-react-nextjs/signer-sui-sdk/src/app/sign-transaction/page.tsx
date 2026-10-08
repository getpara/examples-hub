import type { Metadata } from "next";
import { SuiTransferContainer } from "@/components/demos/SuiTransferContainer";

export const metadata: Metadata = {
  title: "SUI Transfer | Para Sui SDK Signer",
  description: "Send Sui Testnet SUI with a Para Sui transaction signer.",
};

export default function SignTransactionPage() {
  return <SuiTransferContainer />;
}
