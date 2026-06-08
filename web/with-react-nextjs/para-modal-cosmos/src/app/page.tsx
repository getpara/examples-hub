import type { Metadata } from "next";
import { ParaModalCosmosExample } from "@/components/ParaModalCosmosExample";

export const metadata: Metadata = {
  title: "Para Modal Cosmos Example",
  description: "Connect a Cosmos wallet with Para Modal and sign an ADR-036 message.",
};

export default function Home() {
  return <ParaModalCosmosExample />;
}
