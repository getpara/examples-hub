import {ParaMobile, Environment} from '@getpara/react-native-wallet';

// Create a dedicated Para instance here to avoid circular dependencies
export const para = new ParaMobile(Environment.SANDBOX, '68baedb5cfd41c782831fe98c9b4d854', undefined, {
  disableWorkers: true,
});
