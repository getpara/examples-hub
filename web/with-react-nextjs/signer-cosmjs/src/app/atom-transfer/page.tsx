import type { Metadata } from "next";
import AtomTransferDemo from "@/components/demos/AtomTransferDemo";

export const metadata: Metadata = {
  title: "ATOM Transfer | Para CosmJS Signer",
  description: "Send ATOM with a Para Cosmos signer and CosmJS SigningStargateClient.",
};

export default function AtomTransferPage() {
  return <AtomTransferDemo />;
}
