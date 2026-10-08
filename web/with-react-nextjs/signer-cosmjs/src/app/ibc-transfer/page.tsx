import type { Metadata } from "next";
import { IbcTransferContainer } from "@/components/demos/IbcTransferContainer";

export const metadata: Metadata = {
  title: "IBC Transfer | Para CosmJS Signer",
  description: "Send an IBC transfer with a Para Cosmos signer and CosmJS.",
};

export default function IbcTransferPage() {
  return <IbcTransferContainer />;
}
