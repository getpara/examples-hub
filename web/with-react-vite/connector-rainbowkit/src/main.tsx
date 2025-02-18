import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ParaProviders } from "./components/ParaProviders.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ParaProviders>
      <App />
    </ParaProviders>
  </StrictMode>
);
