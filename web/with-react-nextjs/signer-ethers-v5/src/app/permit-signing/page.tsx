import type { Metadata } from "next";
import PermitSigningDemo from "@/components/demos/PermitSigningDemo";

export const metadata: Metadata = {
  title: "Permit Signing | Para Ethers v5 Signer",
  description: "Sign an ERC20 permit with a Para Ethers v5 signer.",
};

export default function PermitSigningPage() {
  return <PermitSigningDemo />;
}
