import type { Metadata } from "next";
import IbcTransferDemo from "@/components/demos/IbcTransferDemo";

export const metadata: Metadata = {
  title: "IBC Transfer | Para CosmJS Signer",
  description: "Send an IBC transfer with a Para Cosmos signer and CosmJS.",
};

export default function IbcTransferPage() {
  return <IbcTransferDemo />;
}
