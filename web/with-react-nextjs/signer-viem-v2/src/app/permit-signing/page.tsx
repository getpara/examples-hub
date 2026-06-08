import type { Metadata } from "next";
import PermitSigningDemo from "@/components/demos/PermitSigningDemo";

export const metadata: Metadata = {
  title: "Permit Signing | Para Viem v2 Signer",
  description: "Sign an ERC20 permit with a Para Viem v2 wallet client.",
};

export default function PermitSigningPage() {
  return <PermitSigningDemo />;
}
