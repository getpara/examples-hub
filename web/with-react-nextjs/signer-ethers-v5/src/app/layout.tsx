import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { EthersV5Example } from "@/components/EthersV5Example";
import { ParaProvider } from "@/components/ParaProvider";

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
      <body>
        <ParaProvider>
          <EthersV5Example>{children}</EthersV5Example>
        </ParaProvider>
      </body>
    </html>
  );
}
