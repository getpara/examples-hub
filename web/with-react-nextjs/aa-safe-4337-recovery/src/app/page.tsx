import type { Metadata } from "next";
import { SafeRecoveryExample } from "@/components/SafeRecoveryExample";

export const metadata: Metadata = {
  title: "Safe Recovery Example",
  description: "Use Para as a recovery guardian for a Safe ERC-4337 account.",
};

export default function Home() {
  return <SafeRecoveryExample />;
}
