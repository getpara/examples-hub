import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { sass } from '@stencil/sass';
import { inlineSvg } from 'stencil-inline-svg';
import dotenv from 'rollup-plugin-dotenv';

export const config: Config = {
  namespace: 'Capsule',
  plugins: [sass(), inlineSvg(), dotenv()],
  extras: {
    enableImportInjection: true,
  },
  outputTargets: [
    // By default, the generated proxy components will
    // leverage the output from the `dist` target, so we
    // need to explicitly define that output alongside the
    // React target
    {
      type: 'dist',
    },
    reactOutputTarget({
      componentCorePackage: '@usecapsule/core-components',
      proxiesFile: '../react-components/lib/components/stencil-generated/index.ts',
    }),
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers,
      copy: [
        {
          src: '../css',
          dest: 'css',
        },
      ],
    },
  ],
  testing: {
    browserHeadless: 'new',
    setupFilesAfterEnv: ['./jest.setup.ts'],
  },
};
