import { NPM, PNPM, Yarn } from '@getpara/react-component-library';
import { PackageManager } from '../types/packageManager';

export const formatPackageManagerName = (pm?: PackageManager) => {
  switch (pm?.toUpperCase()) {
    case PackageManager.NPM: {
      return 'NPM';
    }
    case PackageManager.YARN: {
      return 'Yarn';
    }
    case PackageManager.PNPM: {
      return 'PNPM';
    }
    default: {
      return '';
    }
  }
};

export const getPackageManagerInstallString = (pm?: PackageManager) => {
  switch (pm?.toUpperCase()) {
    case PackageManager.NPM: {
      return 'npm install';
    }
    case PackageManager.YARN: {
      return 'yarn add';
    }
    case PackageManager.PNPM: {
      return 'pnpm install';
    }
    default: {
      return '';
    }
  }
};

export const getPackageManagerIcon = (pm?: PackageManager) => {
  switch (pm?.toUpperCase()) {
    case PackageManager.NPM: {
      return NPM;
    }
    case PackageManager.YARN: {
      return Yarn;
    }
    case PackageManager.PNPM: {
      return PNPM;
    }
    default:
      return null;
  }
};
