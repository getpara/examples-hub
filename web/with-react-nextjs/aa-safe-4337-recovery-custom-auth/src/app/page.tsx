import type { Metadata } from "next";
import { SafeRecoveryCustomAuthExample } from "@/components/SafeRecoveryCustomAuthExample";

export const metadata: Metadata = {
  title: "Safe Recovery Custom Auth Example",
  description: "Use custom passkey auth UI with Para as a Safe recovery guardian.",
};

export default function Home() {
  return <SafeRecoveryCustomAuthExample />;
}
