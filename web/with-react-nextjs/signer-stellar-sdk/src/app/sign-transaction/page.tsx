import type { Metadata } from "next";
import { XlmTransferContainer } from "@/components/demos/XlmTransferContainer";

export const metadata: Metadata = {
  title: "XLM Transfer | Para Stellar SDK",
  description: "Send Stellar Testnet XLM with a Para Stellar transaction signer.",
};

export default function SignTransactionPage() {
  return <XlmTransferContainer />;
}
