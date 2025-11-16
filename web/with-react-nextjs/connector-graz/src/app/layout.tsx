import "@/styles/globals.css";
import "@getpara/react-sdk-lite/styles.css";
import { Provider } from "@/context/Provider";
import { AppWrapper } from "@/components/layout/AppWrapper";
import { ModalProvider } from "@/context/ModalContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <ModalProvider>
            <AppWrapper>{children}</AppWrapper>
          </ModalProvider>
        </Provider>
      </body>
    </html>
  );
}
