import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { SolanaAnchorExample } from "@/components/SolanaAnchorExample";

export const metadata: Metadata = {
  title: "Para Solana Anchor Signer",
  description: "An example showcasing how to sign Solana and Anchor transactions with the Para SDK",
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
          <SolanaAnchorExample>{children}</SolanaAnchorExample>
        </ParaProvider>
      </body>
    </html>
  );
}
