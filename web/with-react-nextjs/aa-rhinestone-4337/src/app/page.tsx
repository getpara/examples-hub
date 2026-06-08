import type { Metadata } from "next";
import { Rhinestone4337Example } from "@/components/Rhinestone4337Example";

export const metadata: Metadata = {
  title: "Rhinestone Account Abstraction Example",
  description: "Create a Rhinestone global wallet with Para and EIP-4337.",
};

export default function Home() {
  return <Rhinestone4337Example />;
}
