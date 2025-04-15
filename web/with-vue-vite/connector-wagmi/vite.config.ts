import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), react(), nodePolyfills(), tailwindcss()],
  resolve: {
    alias: {
      wagmi: "@wagmi/vue",
    },
  },
});
