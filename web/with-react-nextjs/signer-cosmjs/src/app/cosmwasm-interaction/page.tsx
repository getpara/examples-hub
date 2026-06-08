import type { Metadata } from "next";
import CosmWasmInteractionDemo from "@/components/demos/CosmWasmInteractionDemo";

export const metadata: Metadata = {
  title: "CosmWasm Contract | Para CosmJS Signer",
  description: "Query and execute CosmWasm contracts with a Para Cosmos signer.",
};

export default function CosmWasmInteractionPage() {
  return <CosmWasmInteractionDemo />;
}
