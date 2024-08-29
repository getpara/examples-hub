import { Environment } from '../types/environment';

export const getKeyColor = (env: Environment) =>
  env === Environment.PROD ? 'var(--cpsl-color-utility-green)' : 'var(--cpsl-color-utility-yellow)';

export const formatEnvName = (env: Environment) => {
  switch (env.toUpperCase()) {
    case Environment.BETA: {
      return 'Beta';
    }
    case Environment.PROD: {
      return 'Production';
    }
    case Environment.SANDBOX: {
      return 'Sandbox';
    }
    case Environment.DEV: {
      return 'Development';
    }
  }
};
