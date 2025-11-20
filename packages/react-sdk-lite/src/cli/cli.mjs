#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const PACKAGES_TO_STUB = [
  '@getpara/evm-wallet-connectors',
  '@getpara/cosmos-wallet-connectors',
  '@getpara/solana-wallet-connectors',
  '@farcaster/miniapp-sdk',
  '@farcaster/miniapp-wagmi-connector',
  '@farcaster/mini-app-solana',
];

const checkForPackages = async () => {
  let pathToNodeModules = path.resolve('node_modules');

  // Check if pnpm-lock.yaml actually exists
  const pnpmLockPath = path.resolve(process.cwd(), 'pnpm-lock.yaml');
  let isPNPM = false;

  try {
    await fs.access(pnpmLockPath);
    isPNPM = true;
  } catch {
    isPNPM = false;
  }

  // If it's a PNPM project, adjust the node_modules path accordingly to account for virtual store
  // NODE_PATH is set by PNPM to include the correct paths
  if (isPNPM && process.env.NODE_PATH) {
    const endingNodePathString = '@getpara/node_modules';
    const nodePathSplit = process.env.NODE_PATH.split(path.delimiter);
    const fullPath = nodePathSplit.find(p => p.endsWith(endingNodePathString));
    if (fullPath) {
      const newPath = fullPath.replace(endingNodePathString, '');
      if (newPath) {
        pathToNodeModules = newPath;
      }
    }
  }

  for (let i = 0; i < PACKAGES_TO_STUB.length; i++) {
    const packageName = PACKAGES_TO_STUB[i];
    try {
      await import(packageName);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        const packageJsonContent = { name: packageName, main: './index.js' };

        await fs.mkdir(path.join(pathToNodeModules, packageName), { recursive: true });
        const indexPath = path.join(pathToNodeModules, packageName, 'index.js');
        const packageJsonPath = path.join(pathToNodeModules, packageName, 'package.json');

        try {
          await fs.access(indexPath);
        } catch {
          await fs.writeFile(indexPath, '//STUB');
        }

        try {
          await fs.access(packageJsonPath);
        } catch {
          await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent), {
            encoding: 'utf-8',
          });
        }
      }
    }
  }

  process.exit();
};

await checkForPackages();
