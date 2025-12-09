"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import { PARA_API_KEY } from "@/config/constants";

interface ModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

const queryClient = new QueryClient();

const paraClientConfig = { apiKey: PARA_API_KEY };
const paraConfig = { appName: "Custom Email Auth", disableEmbeddedModal: true };

function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>{children}</ModalContext.Provider>
  );
}

export function CustomModalProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider paraClientConfig={paraClientConfig} config={paraConfig}>
        <ModalProvider>{children}</ModalProvider>
      </ParaProvider>
    </QueryClientProvider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a CustomModalProvider");
  }
  return context;
}
