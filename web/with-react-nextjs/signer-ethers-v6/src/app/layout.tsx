import type { Metadata } from "next";
import { ParaProvider } from "@/components/ParaProvider";
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
        <ParaProvider>
          <Header />
          <main>{children}</main>
        </ParaProvider>
      </body>
    </html>
  );
}
