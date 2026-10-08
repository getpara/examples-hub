import { lightTheme, type Theme } from "@rainbow-me/rainbowkit";

const baseTheme = lightTheme({
  accentColor: "#ff4e00",
  accentColorForeground: "white",
  borderRadius: "none",
  overlayBlur: "large",
});

export const rainbowKitTheme: Theme = {
  ...baseTheme,
  fonts: {
    body: "ui-sans-serif, system-ui, sans-serif",
  },
};
