import type React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ParaProvider } from "@/context/ParaProvider";
import { QueryProvider } from "@/context/QueryProvider";
import Header from "@/components/header";
import "./globals.css";
import "@getpara/react-sdk/styles.css";

export const metadata = {
  title: "Para Bulk Wallet Generator",
  description: "Generate wallets for Twitter or Telegram handles in bulk",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ParaProvider>
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </ParaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
