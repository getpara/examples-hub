import type { Metadata } from "next";
import { ZeroDev4337Example } from "@/components/ZeroDev4337Example";

export const metadata: Metadata = {
  title: "ZeroDev Account Abstraction Example",
  description: "Create a ZeroDev Kernel smart account with Para and send a sponsored transaction.",
};

export default function Home() {
  return <ZeroDev4337Example />;
}
