import type { Metadata } from "next";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { AppKitProvider } from "@/context/AppKitProvider";
import { AppWrapper } from "@/components/layout/AppWrapper";

export const metadata: Metadata = {
  title: "Reown AppKit + Para",
  description: "Reown AppKit integration with Para wallet connector",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppKitProvider>
          <AppWrapper>{children}</AppWrapper>
        </AppKitProvider>
      </body>
    </html>
  );
}
