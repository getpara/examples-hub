import type { Metadata } from "next";
import { Porto7702Example } from "@/components/Porto7702Example";

export const metadata: Metadata = {
  title: "Porto EIP-7702 Example",
  description: "Upgrade a Para wallet EOA with Porto EIP-7702 account delegation.",
};

export default function Home() {
  return <Porto7702Example />;
}
