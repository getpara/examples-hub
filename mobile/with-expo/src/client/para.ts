import { ParaMobile } from '@getpara/react-native-wallet';
import { PARA_API_KEY, PARA_ENVIRONMENT } from '@/constants/envs';

export async function createParaClient(): Promise<ParaMobile> {
  if (!PARA_API_KEY) {
    throw new Error(
      'Missing required environment variable: EXPO_PUBLIC_PARA_API_KEY'
    );
  }
  if (!PARA_ENVIRONMENT) {
    throw new Error(
      'Missing required environment variable: EXPO_PUBLIC_PARA_ENVIRONMENT'
    );
  }
  const para = new ParaMobile(PARA_ENVIRONMENT, PARA_API_KEY, undefined, {
    disableWorkers: true,
  });
  await para.init();
  return para;
}
