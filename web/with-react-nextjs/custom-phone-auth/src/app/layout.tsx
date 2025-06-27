import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { ModalProvider } from "@/context/ModalContext";
import { PhoneModal } from "@/components/PhoneModal";
import { Header } from "@/components/layout/Header";
import { APP_NAME, APP_DESCRIPTION } from "@/config/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ModalProvider>
            <Header />
            {children}
            <PhoneModal />
          </ModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
