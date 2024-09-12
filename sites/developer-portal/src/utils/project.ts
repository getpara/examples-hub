import { Framework } from '../types/framework';
import { PackageManager } from '../types/packageManager';

export const formatFrameworkName = (framework: Framework) => {
  switch (framework.toUpperCase()) {
    case Framework.REACT: {
      return 'React';
    }
    case Framework.REACT_NATIVE: {
      return 'React Native';
    }
    case Framework.VUE: {
      return 'Vue';
    }
  }
};

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
