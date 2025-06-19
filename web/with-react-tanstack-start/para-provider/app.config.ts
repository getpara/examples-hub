import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  tsr: { appDirectory: "src" },

  vite: {
    plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] })],
    define: {
      "process.browser": true,
    },
  },

  routers: {
    client: {
      vite: {
        plugins: [nodePolyfills()],
      },
    },
  },
});
