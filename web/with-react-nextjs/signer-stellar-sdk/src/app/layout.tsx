import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";
import { StellarSdkExample } from "@/components/StellarSdkExample";

export const metadata: Metadata = {
  title: "Para Stellar SDK",
  description: "An example showcasing how to sign Stellar messages and transactions with Para",
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
          <StellarSdkExample>{children}</StellarSdkExample>
        </ParaProvider>
      </body>
    </html>
  );
}
