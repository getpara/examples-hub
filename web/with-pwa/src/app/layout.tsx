import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { ParaProvider } from "@/components/ParaProvider";

export const metadata: Metadata = {
  title: "Para PWA Example",
  description: "Connect with the Para Modal and sign a message from an installable web app.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Para PWA",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#fcf9f7",
};

const REGISTER_SERVICE_WORKER = `
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => console.log("SW registered:", registration),
      (error) => console.log("SW registration failed:", error)
    );
  });
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="register-sw" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: REGISTER_SERVICE_WORKER }} />
      </head>
      <body>
        <ParaProvider>{children}</ParaProvider>
      </body>
    </html>
  );
}
