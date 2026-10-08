import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { EthersV6Example } from "@/components/EthersV6Example";
import { ParaProvider } from "@/components/ParaProvider";

export const metadata: Metadata = {
  title: "Para Ethers v6 Signer",
  description: "An example showcasing how to sign with the Para SDK using Ethers v6",
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
          <EthersV6Example>{children}</EthersV6Example>
        </ParaProvider>
      </body>
    </html>
  );
}
