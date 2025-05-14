import {ParaMobile, Environment} from '@getpara/react-native-wallet';

// Create a dedicated Para instance here to avoid circular dependencies
export const para = new ParaMobile(
  Environment.SANDBOX,
  '12e3517d125169ea9847d0da5bdcd9c9',
  undefined,
  {
    disableWorkers: true,
  },
);
