"use client";

import { useEffect, useEffectEvent } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  "data-testid"?: string;
}

export function Modal({ isOpen, onClose, children, "data-testid": dataTestId }: ModalProps) {
  const onCloseEvent = useEffectEvent(onClose);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseEvent();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity" />
      <div className="relative z-50 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl" data-testid={dataTestId}>
        <button
          type="button"
          onClick={onClose}
          data-testid="modal-close-button"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-card-foreground"
          aria-label="Close modal">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
