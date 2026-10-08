import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { SolanaWeb3Example } from "@/components/SolanaWeb3Example";

export const metadata: Metadata = {
  title: "Para Solana web3.js Signer",
  description: "An example showcasing how to sign Solana web3.js messages and transactions with Para",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ParaProvider>
          <SolanaWeb3Example>{children}</SolanaWeb3Example>
        </ParaProvider>
      </body>
    </html>
  );
}
