import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { SuiSdkExample } from "@/components/SuiSdkExample";

export const metadata: Metadata = {
  title: "Para Sui SDK Signer",
  description: "An example showcasing how to sign Sui messages, transactions, and multisigs with Para",
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
          <SuiSdkExample>{children}</SuiSdkExample>
        </ParaProvider>
      </body>
    </html>
  );
}
