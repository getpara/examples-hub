import type { Metadata } from "next";
import { AlchemyExample } from "@/components/AlchemyExample";

export const metadata: Metadata = {
  title: "Alchemy AA Example",
  description: "Create an Alchemy smart account with Para and send a gas-sponsored transaction.",
};

export default function Home() {
  return <AlchemyExample />;
}
