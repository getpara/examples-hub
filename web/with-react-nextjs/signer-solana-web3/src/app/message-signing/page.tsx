import type { Metadata } from "next";
import { SolanaWeb3App } from "@/components/SolanaWeb3App";
import { SolanaWeb3Preview } from "@/components/SolanaWeb3Preview";
import MessageSigningDemo from "@/components/demos/MessageSigningDemo";

export const metadata: Metadata = {
  title: "Message Signing | Para Solana web3.js",
  description: "Sign and verify arbitrary messages with a Para Solana web3.js signer.",
};

export default function MessageSigningPage() {
  return (
    <>
      <SolanaWeb3Preview variant="message-signing" />
      <SolanaWeb3App>
        <MessageSigningDemo />
      </SolanaWeb3App>
    </>
  );
}
