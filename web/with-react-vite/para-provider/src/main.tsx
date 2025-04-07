import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "./constants";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        callbacks={{
          onLogout: (event) => console.log("Logout:", event.detail),
          onLogin: (event) => console.log("Login:", event.detail),
          onSignMessage: (event) => console.log("Message Signed:", event.detail),
        }}>
        <App />
      </ParaProvider>
    </QueryClientProvider>
  </StrictMode>
);
