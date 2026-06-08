import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { QueryProvider } from "@/context/QueryProvider";
import { WagmiProvider } from "@/context/WagmiProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Para + Wagmi Example",
  description: "Para integration with a Wagmi wallet connector and Sepolia ETH transfers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
