import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alchemy EIP-7702 Example",
  description: "Para SDK with Alchemy Account Abstraction using EIP-7702 for gas-sponsored transactions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParaProvider>
          <Header />
          {children}
        </ParaProvider>
      </body>
    </html>
  );
}
