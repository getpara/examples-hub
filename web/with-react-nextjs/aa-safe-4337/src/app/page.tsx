import type { Metadata } from "next";
import { Safe4337Example } from "@/components/Safe4337Example";

export const metadata: Metadata = {
  title: "Safe Account Abstraction Example",
  description: "Create a Safe smart account with Para and send a sponsored transaction.",
};

export default function Home() {
  return <Safe4337Example />;
}
