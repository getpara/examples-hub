import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@getpara/react-sdk/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Custom Combined Auth Example",
  description: "Build a custom Para authentication flow with email, phone, and OAuth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
