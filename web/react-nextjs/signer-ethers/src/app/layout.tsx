import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CapsuleProvider } from "@/components/CapsuleProvider";
import Header from "@/components/Header";
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
  title: "Capsule Signing",
  description: "An example showcasing how to sign with the Capsule SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CapsuleProvider>
          <Header />
          <main>{children}</main>
        </CapsuleProvider>
      </body>
    </html>
  );
}
