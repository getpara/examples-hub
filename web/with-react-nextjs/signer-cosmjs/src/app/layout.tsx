import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { CosmjsExample } from "@/components/CosmjsExample";
import { ParaProvider } from "@/components/ParaProvider";

export const metadata: Metadata = {
  title: "Para CosmJS Signer",
  description: "Sign Cosmos transactions with the Para SDK and CosmJS",
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
          <CosmjsExample>{children}</CosmjsExample>
        </ParaProvider>
      </body>
    </html>
  );
}
