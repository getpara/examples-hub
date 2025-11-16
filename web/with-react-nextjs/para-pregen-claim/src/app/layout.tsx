import "@/styles/globals.css";
import { QueryProvider, ParaProvider } from "@/context";

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
            {children}
          </ParaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
