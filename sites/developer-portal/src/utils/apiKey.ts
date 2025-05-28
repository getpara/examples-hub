import { Environment } from '../types/environment';

export const formatEnvName = (env: Environment) => {
  switch (env.toUpperCase()) {
    case Environment.PROD: {
      return 'Production';
    }
    case Environment.BETA: {
      return 'Development';
    }
    case Environment.SANDBOX: {
      return 'Sandbox';
    }
    case Environment.DEV: {
      return 'Local';
    }
  }
};
