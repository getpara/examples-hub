import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { ParaProvider } from "@/components/ParaProvider";

export const metadata: Metadata = {
  title: "Porto EIP-7702 Example",
  description: "Upgrade a Para wallet EOA in place to a Porto account with EIP-7702.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ParaProvider>{children}</ParaProvider>
      </body>
    </html>
  );
}
