import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { SolanaSignersV2Example } from "@/components/SolanaSignersV2Example";

export const metadata: Metadata = {
  title: "Para Solana Signers v2",
  description: "An example showcasing how to sign Solana messages and transactions with Para's Signers v2 integration",
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
          <SolanaSignersV2Example>{children}</SolanaSignersV2Example>
        </ParaProvider>
      </body>
    </html>
  );
}
