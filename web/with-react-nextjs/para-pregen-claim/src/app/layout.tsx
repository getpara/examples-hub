import "@/styles/globals.css";
import { ParaProvider } from "@/components/ParaProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Para Pregen Claim",
  description: "Create and claim a Para pregen wallet through a UUID-to-email upgrade flow.",
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
