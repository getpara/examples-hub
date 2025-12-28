import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import Header from "@/components/layout/Header";
import { ParaProvider } from "@/components/ParaProvider";

export const metadata: Metadata = {
  title: "Para Solana Signers V2 Integration",
  description: "Solana Signers V2 integration with Para SDK",
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
          <Header />
          <main>{children}</main>
        </ParaProvider>
      </body>
    </html>
  );
}
