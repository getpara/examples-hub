import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { ViemV2Example } from "@/components/ViemV2Example";

export const metadata: Metadata = {
  title: "Para Viem v2 Signer",
  description: "An example showcasing how to sign with the Para SDK using Viem v2",
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
          <ViemV2Example>{children}</ViemV2Example>
        </ParaProvider>
      </body>
    </html>
  );
}
