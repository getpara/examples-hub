import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { execSync } from 'child_process';

// Get git commit hash at build time
const gitCommit = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
})();

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: {
    __BRIDGE_COMMIT__: JSON.stringify(gitCommit),
  },
  build: {
    outDir: 'dist',
  },
});
