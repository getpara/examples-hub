import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { ParaProvider } from "@/components/ParaProvider";

export const metadata: Metadata = {
  title: "Para + Wagmi Example",
  description: "Connect Para as a wagmi connector and send Sepolia ETH.",
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
