import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { QueryProvider } from "@/context";
import { WagmiProvider } from "@/context/WagmiProvider";
import { AppWrapper } from "@/components/layout/AppWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          <QueryProvider>
            <AppWrapper>{children}</AppWrapper>
          </QueryProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
