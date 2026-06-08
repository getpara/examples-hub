import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@getpara/react-sdk/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rhinestone Account Abstraction Example",
  description: "Create a Rhinestone global wallet with Para and EIP-4337.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
