"use client";

import "./globals.css";
import { CustomModalProvider } from "@/context/CustomModalProvider";
import Header from "@/components/layout/Header";
import { AuthModal } from "@/components/AuthModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CustomModalProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <AuthModal />
        </CustomModalProvider>
      </body>
    </html>
  );
}
