import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { ParaProvider } from "@/components/ParaProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Signer Canton Network Example",
  description: "Onboard a Canton Network external party signed by Para's embedded Ed25519 key",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ParaProvider>{children}</ParaProvider>
      </body>
    </html>
  );
}
