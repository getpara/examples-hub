import type { Metadata } from "next";
import { ParaModalSolanaExample } from "@/components/ParaModalSolanaExample";

export const metadata: Metadata = {
  title: "Para Modal Solana Example",
  description: "Connect with Para Modal using Solana wallet support and sign a message.",
};

export default function Home() {
  return <ParaModalSolanaExample />;
}
