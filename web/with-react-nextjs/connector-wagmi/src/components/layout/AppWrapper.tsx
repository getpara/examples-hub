"use client";

import Header from "./Header";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { ModalProvider, useModal } from "@/context/ModalContext";

function AppContent({ children }: { children: React.ReactNode }) {
  const { isModalOpen, openModal, closeModal } = useModal();

  return (
    <>
      <ConnectWalletModal isOpen={isModalOpen} onClose={closeModal} />
      <Header onConnectClick={openModal} />
      {children}
    </>
  );
}

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <AppContent>{children}</AppContent>
    </ModalProvider>
  );
}