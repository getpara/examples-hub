import { PackageManager } from '../types/packageManager';

export const formatPackageManagerName = (pm: PackageManager) => {
  switch (pm.toUpperCase()) {
    case PackageManager.NPM: {
      return 'NPM';
    }
    case PackageManager.YARN: {
      return 'Yarn';
    }
    case PackageManager.PNPM: {
      return 'PNPM';
    }
  }
};

export const getPackageManagerInstallString = (pm: PackageManager) => {
  switch (pm.toUpperCase()) {
    case PackageManager.NPM: {
      return 'npm install';
    }
    case PackageManager.YARN: {
      return 'yarn add';
    }
    case PackageManager.PNPM: {
      return 'pnpm install';
    }
  }
};
