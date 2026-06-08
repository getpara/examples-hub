import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { ConnectedHeader } from "@/components/layout/ConnectedHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Para CosmJS Signer Example",
  description: "Sign Cosmos transactions with Para SDK and CosmJS",
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
          <ConnectedHeader />
          {children}
        </ParaProvider>
      </body>
    </html>
  );
}
