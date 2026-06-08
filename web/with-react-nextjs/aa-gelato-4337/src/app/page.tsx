import type { Metadata } from "next";
import { GelatoExample } from "@/components/GelatoExample";

export const metadata: Metadata = {
  title: "Gelato Account Abstraction Example",
  description: "Create a Gelato smart account with Para and send a sponsored transaction.",
};

export default function Home() {
  return <GelatoExample />;
}
