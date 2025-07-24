import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@getpara/react-sdk/styles.css";
import App from "./App.tsx";
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
