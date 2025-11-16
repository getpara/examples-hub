import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/context/para-providers";
import Navbar from "@/components/navbar";
import BackgroundPattern from "@/components/background-pattern";
import "@getpara/react-sdk/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZeroDev Demo - Smart Wallets",
  description: "Create and manage ERC-4337 smart accounts with ZeroDev. Experience gasless transactions and Kernel smart accounts on Sepolia testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden p-4">
            <BackgroundPattern />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
