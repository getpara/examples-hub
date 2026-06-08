import type { Metadata } from "next";
import { Gelato7702Example } from "@/components/Gelato7702Example";

export const metadata: Metadata = {
  title: "Gelato EIP-7702 Example",
  description: "Delegate smart account behavior to a Para wallet EOA with Gelato and send a sponsored transaction.",
};

export default function Home() {
  return <Gelato7702Example />;
}
