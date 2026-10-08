import type { Metadata } from "next";
import { PermitSigningContainer } from "@/components/demos/PermitSigningContainer";

export const metadata: Metadata = {
  title: "Permit Signing | Para Viem v2 Signer",
  description: "Sign an ERC20 permit with a Para Viem v2 wallet client.",
};

export default function PermitSigningPage() {
  return <PermitSigningContainer />;
}
