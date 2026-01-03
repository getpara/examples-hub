import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import App from "@/app/App";
import { QueryProvider } from "@/context/QueryProvider";
import { ParaProvider } from "@/context/ParaProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ParaProvider>
        <App />
      </ParaProvider>
    </QueryProvider>
  </StrictMode>
);
