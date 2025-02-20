import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ParaProvider } from "./components/ParaProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ParaProvider>
      <App />
    </ParaProvider>
  </StrictMode>
);
