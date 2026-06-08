import type { Metadata } from "next";
import { StellarSdkApp } from "@/components/StellarSdkApp";
import StellarSdkExampleSelector from "@/components/demos/StellarSdkExampleSelector";

export const metadata: Metadata = {
  title: "Para Stellar SDK Example",
  description: "Explore Para signer flows for Stellar messages, transactions, and auth entries.",
};

export default function Home() {
  return (
    <StellarSdkApp>
      <StellarSdkExampleSelector />
    </StellarSdkApp>
  );
}
