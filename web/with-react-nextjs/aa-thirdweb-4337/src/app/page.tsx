import type { Metadata } from "next";
import { Thirdweb4337Example } from "@/components/Thirdweb4337Example";

export const metadata: Metadata = {
  title: "Thirdweb Account Abstraction Example",
  description: "Create a Thirdweb EIP-4337 smart account with Para and send a sponsored transaction.",
};

export default function Home() {
  return <Thirdweb4337Example />;
}
