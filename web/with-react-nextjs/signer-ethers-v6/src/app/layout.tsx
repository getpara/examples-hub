import type { Metadata } from "next";
import { QueryProvider } from "@/context/QueryProvider";
import { ParaProvider } from "@/context/ParaProvider";
import Header from "@/components/layout/Header";
import "@getpara/react-sdk/styles.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Para Signing",
  description: "An example showcasing how to sign with the Para SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <ParaProvider>
            <Header />
            <main>{children}</main>
          </ParaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
