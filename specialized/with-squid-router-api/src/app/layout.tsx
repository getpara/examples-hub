import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { QueryProvider } from "@/context/QueryProvider";
import { ParaProvider } from "@/context/ParaProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Bridge",
  description: "Bridge your assets across different blockchains",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ParaProvider>{children}</ParaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
