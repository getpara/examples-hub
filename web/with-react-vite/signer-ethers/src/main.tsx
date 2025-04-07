import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ParaProvider } from "./components/ParaProvider.tsx";
import Header from "./components/Header.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ParaProvider>
      <BrowserRouter>
        <Header />
        <main>
          <App />
        </main>
      </BrowserRouter>
    </ParaProvider>
  </StrictMode>
);
