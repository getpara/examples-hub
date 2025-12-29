import type { Metadata } from "next";
import { ParaProvider } from "@/components/ParaProvider";
import Header from "@/components/layout/Header";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";

export const metadata: Metadata = {
  title: "Para Viem v2 Demo",
  description: "Examples of signing and transactions with Para SDK using Viem v2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ParaProvider>
          <Header />
          <main>{children}</main>
        </ParaProvider>
      </body>
    </html>
  );
}
