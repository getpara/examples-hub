import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ParaProvider } from "@/context/ParaProvider";
import { QueryProvider } from "@/context/QueryProvider";
import Header from "@/components/Header";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Relay Bridge Integration",
  description: "Bridge assets across blockchains using Relay API with Para SDK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
