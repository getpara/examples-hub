import type { Metadata } from "next";
import { ReownAppKitExample } from "@/components/ReownAppKitExample";

export const metadata: Metadata = {
  title: "Para + Reown AppKit Example",
  description: "Connect Para through Reown AppKit and inspect wallet details.",
};

export default function Home() {
  return <ReownAppKitExample />;
}
