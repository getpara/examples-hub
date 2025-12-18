import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ParaProvider } from "@/components/ParaProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Wallet Demo - Rhinestone",
  description:
    "Experience multichain deposits and cross-chain transactions with Rhinestone SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ParaProvider>{children}</ParaProvider>
      </body>
    </html>
  );
}
