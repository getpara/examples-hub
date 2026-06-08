import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { AppKitProvider } from "@/context/AppKitProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Para + Reown AppKit Example",
  description: "Para integration with Reown AppKit wallet connector",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppKitProvider>
          {children}
        </AppKitProvider>
      </body>
    </html>
  );
}
