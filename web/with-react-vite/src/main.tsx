import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@getpara/react-sdk/styles.css";
import App from "./App.tsx";
import { QueryProvider } from "@/context/QueryProvider";
import { ParaProvider } from "@/context/ParaProvider";
import { Header } from "@/components/layout/Header";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ParaProvider>
        <Header />
        <App />
      </ParaProvider>
    </QueryProvider>
  </StrictMode>
);
