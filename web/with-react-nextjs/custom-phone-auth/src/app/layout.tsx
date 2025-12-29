import "./globals.css";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ParaProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </ParaProvider>
      </body>
    </html>
  );
}
