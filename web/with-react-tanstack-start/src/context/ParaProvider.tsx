import { ParaProvider as Provider, Environment } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "~/config/constants";

export function ParaProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider
      paraClientConfig={{
        apiKey: API_KEY,
        env: ENVIRONMENT as Environment,
      }}
      config={{ appName: "Para Modal Example" }}
      paraModalConfig={{
        theme: {
          foregroundColor: "#222222",
          backgroundColor: "#FFFFFF",
          mode: "light",
          borderRadius: "none",
          font: "Inter",
        },
      }}>
      {children}
    </Provider>
  );
}