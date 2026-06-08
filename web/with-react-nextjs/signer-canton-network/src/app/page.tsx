import type { Metadata } from "next";
import { CantonNetworkExample } from "@/components/CantonNetworkExample";

export const metadata: Metadata = {
  title: "Signer Canton Network Example",
  description: "Onboard a Canton Network external party signed by Para's embedded Ed25519 key",
};

export default function Home() {
  return <CantonNetworkExample />;
}
