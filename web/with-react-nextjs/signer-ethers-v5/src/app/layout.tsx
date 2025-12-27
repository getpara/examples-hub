import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ParaProvider } from "@/components/ParaProvider";
import Header from "@/components/layout/Header";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Para Ethers v5 Signer",
  description: "An example showcasing how to sign with the Para SDK using Ethers v5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ParaProvider>
          <Header />
          <main>{children}</main>
        </ParaProvider>
      </body>
    </html>
  );
}
