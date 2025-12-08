import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ParaProvider } from "@/context/ParaProvider";
import { QueryProvider } from "@/context/QueryProvider";
import Header from "@/components/Header";
import "./globals.css";
import "@getpara/react-sdk/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jupiter DEX Integration",
  description: "Swap tokens on Solana using Jupiter DEX with Para SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <QueryProvider>
          <ParaProvider>
            <Header />
            <main>{children}</main>
          </ParaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
