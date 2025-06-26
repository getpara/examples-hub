import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import Header from "@/components/layout/Header";
import { ParaProvider } from "@/context/ParaProvider";
import { QueryProvider } from "@/context/QueryProvider";

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
