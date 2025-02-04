import { parentPort } from 'worker_threads';
import { Environment } from '@getpara/server-sdk';
import { handleMessage } from '@getpara/server-sdk/dist/cjs/workers/worker';

interface Message {
  env: Environment;
  apiKey?: string;
  offloadMPCComputationURL?: string;
  disableWorkers?: boolean;
  functionType: string;
  params: Record<string, any>;
  sessionCookie?: string;
  useDKLS?: boolean;
  disableWebSockets?: boolean;
  workId: string;
}

parentPort.on('message', async (messageData: Message) => {
  const result = await handleMessage({ data: messageData });
  parentPort.postMessage(result);
});
