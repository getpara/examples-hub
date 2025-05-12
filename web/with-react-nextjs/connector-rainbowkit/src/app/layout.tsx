import "./globals.css";
import { ParaProviders } from "@/components/ParaProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ParaProviders>{children}</ParaProviders>
      </body>
    </html>
  );
}
