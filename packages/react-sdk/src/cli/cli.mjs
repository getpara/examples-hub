#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const PACKAGES_TO_STUB = [
  '@getpara/evm-wallet-connectors',
  '@getpara/cosmos-wallet-connectors',
  '@getpara/solana-wallet-connectors',
];

const checkForPackages = async () => {
  const pathToParaPackages = require.resolve('@getpara/react-sdk');

  const pathToNodeModules = path.resolve(pathToParaPackages, '../../node_modules');

  for (let i = 0; i < PACKAGES_TO_STUB.length; i++) {
    const packageName = PACKAGES_TO_STUB[i];
    try {
      await import(packageName);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        const packageJsonContent = { name: packageName, main: './index.js' };
        await fs.mkdir(path.join(pathToNodeModules, packageName), { recursive: true });
        await fs.writeFile(path.join(pathToNodeModules, packageName, 'index.js'), '//STUB');
        await fs.writeFile(path.join(pathToNodeModules, packageName, 'package.json'), JSON.stringify(packageJsonContent), {
          encoding: 'utf-8',
        });
      }
    }
  }
};

await checkForPackages();
