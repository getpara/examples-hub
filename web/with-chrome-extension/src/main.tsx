import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import "@getpara/react-sdk/styles.css";
import { App } from "@/app/App";
import { ParaProvider } from "@/components/ParaProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ParaProvider>
      <App />
    </ParaProvider>
  </StrictMode>
);
