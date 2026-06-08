import type { Metadata } from "next";
import { Alchemy7702Example } from "@/components/Alchemy7702Example";

export const metadata: Metadata = {
  title: "Alchemy EIP-7702 Example",
  description: "Upgrade a Para wallet EOA with EIP-7702 and send a gas-sponsored transaction.",
};

export default function Home() {
  return <Alchemy7702Example />;
}
