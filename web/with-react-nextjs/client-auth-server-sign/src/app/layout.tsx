import "@/styles/globals.css";
import { Header } from "@/components/layout";
import { ParaProvider, QueryProvider } from "@/context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
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
