import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { ParaProvider } from "@/components/ParaProvider";

export const metadata: Metadata = {
  title: "Para Modal Multichain Example",
  description: "Connect with the Para Modal and sign a message on EVM, Cosmos, Solana, and Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ParaProvider>{children}</ParaProvider>
      </body>
    </html>
  );
}
