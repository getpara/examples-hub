"use client";

import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { ModalProvider, useModal } from "@/context/ModalContext";
import Header from "@/components/layout/Header";
import { OAuthModal } from "@/components/OAuthModal";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { openModal } = useModal();

  return (
    <>
      <Header onConnectClick={openModal} />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <OAuthModal />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ModalProvider>
            <LayoutContent>{children}</LayoutContent>
          </ModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
