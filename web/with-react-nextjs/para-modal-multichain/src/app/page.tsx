import type { Metadata } from "next";
import { ParaModalMultichainExample } from "@/components/ParaModalMultichainExample";

export const metadata: Metadata = {
  title: "Para Modal Multichain Example",
  description: "Connect with Para Modal across EVM, Cosmos, and Solana wallets.",
};

export default function Home() {
  return <ParaModalMultichainExample />;
}
