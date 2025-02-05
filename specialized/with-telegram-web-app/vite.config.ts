import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        process: true,
        global: true,
        Buffer: true,
      },
    }),
  ],
  base: "/examples-hub/with-telegram-web-app/",
});
