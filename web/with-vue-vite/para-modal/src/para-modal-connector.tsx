import React from "react";
import { createRoot } from "react-dom/client";
import { ParaModal, type ParaModalProps } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

export const createParaModalConnector = (targetEl: HTMLElement, props: Omit<ParaModalProps, "isOpen">) => {
  const root = createRoot(targetEl);

  const state = {
    isOpen: false,
    render: (isOpen: boolean) => {
      state.isOpen = isOpen;
      root.render(
        React.createElement(ParaModal, {
          ...props,
          theme: {
            backgroundColor: "#FFF",
            foregroundColor: "#000",
            accentColor: "#FF754A",
            mode: "light",
            font: "Inter",
            ...props.theme,
          },
          isOpen,
          onClose: () => {
            state.isOpen = false;
            state.render(false);
            props.onClose?.();
          },
        })
      );
    },
  };

  return {
    open: () => state.render(true),
    close: () => state.render(false),
    isOpen: () => state.isOpen,
    unmount: () => root.unmount(),
  };
};
