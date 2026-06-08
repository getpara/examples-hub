import type { Metadata } from "next";
import { WagmiExample } from "@/components/WagmiExample";

export const metadata: Metadata = {
  title: "Para + Wagmi Example",
  description: "Connect Para through Wagmi and send Sepolia ETH.",
};

export default function Home() {
  return <WagmiExample />;
}
