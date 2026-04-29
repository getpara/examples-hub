import { PregenClaimContainer } from "@/components/pregen/PregenClaimContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Para Pregen Claim",
  description: "Create and claim a Para pregen wallet through a UUID-to-email upgrade flow.",
};

export default function Home() {
  return <PregenClaimContainer />;
}
