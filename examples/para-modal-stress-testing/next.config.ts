import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Configuration } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config: Configuration) => {
    // Only apply jitter patch when explicitly enabled via environment variable
    const jitterEnabled = process.env.STRESS_TEST_JITTER === 'true';

    if (jitterEnabled) {
      console.log('[Webpack] 🔧 Applying useEffect jitter patch to Para SDK packages');

      // Use NormalModuleReplacementPlugin to intercept React imports from Para SDK
      const { NormalModuleReplacementPlugin } = require('webpack');

      config.plugins = config.plugins || [];
      config.plugins.push(
        new NormalModuleReplacementPlugin(/^react$/, (resource: { context: string; request: string }) => {
          // Match both node_modules (@getpara/react-sdk*) and local monorepo paths (/packages/react-sdk*)
          const isFromParaSDK =
            resource.context.includes('@getpara/react-sdk-lite') ||
            resource.context.includes('@getpara/react-sdk') ||
            resource.context.includes('/packages/react-sdk-lite') ||
            resource.context.includes('/packages/react-sdk/');

          const modulePath = resource.context.split('node_modules/').pop() || resource.context;

          if (isFromParaSDK) {
            // Replace with our jittered version
            resource.request = path.resolve(__dirname, './src/patches/react-with-jitter.ts');
            console.log(`[Webpack] ⚡ PATCHED: ${modulePath}`);
          } else {
            // Log what we're NOT patching (only show React-related or Next.js modules for brevity)
            if (modulePath.includes('react') || modulePath.includes('next') || modulePath.includes('tanstack')) {
              console.log(`[Webpack] ℹ️  SKIPPED: ${modulePath}`);
            }
          }
        }),
      );
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[Webpack] ℹ️  useEffect jitter patch disabled');
    }

    return config;
  },
};

export default nextConfig;
