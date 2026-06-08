import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@getpara/react-sdk/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Custom OAuth Auth Example",
  description: "Authenticate with Para using custom OAuth provider buttons.",
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
