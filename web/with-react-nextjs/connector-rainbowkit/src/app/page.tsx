import type { Metadata } from "next";
import { RainbowKitExample } from "@/components/RainbowKitExample";

export const metadata: Metadata = {
  title: "Para + RainbowKit Example",
  description: "Connect Para through RainbowKit and sign a message with Wagmi.",
};

export default function Home() {
  return <RainbowKitExample />;
}
