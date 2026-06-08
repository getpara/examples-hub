import type { Metadata } from "next";
import { ParaModalEvmExample } from "@/components/ParaModalEvmExample";

export const metadata: Metadata = {
  title: "Para Modal EVM Example",
  description: "Connect with Para Modal using EVM wallet support and sign a message.",
};

export default function Home() {
  return <ParaModalEvmExample />;
}
