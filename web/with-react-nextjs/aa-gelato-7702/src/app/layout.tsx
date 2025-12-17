import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gelato EIP-7702 Demo",
  description: "Gasless transactions with Gelato smart account and Para wallet integration",
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
