import type { Metadata } from "next";
import { ParaModalExample } from "@/components/ParaModalExample";

export const metadata: Metadata = {
  title: "Para Modal Example",
  description: "Connect with Para Modal and sign a message.",
};

export default function Home() {
  return <ParaModalExample />;
}
