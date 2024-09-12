import { parentPort } from 'worker_threads';
import { Environment } from '@usecapsule/server-sdk';
import { handleMessage } from '@usecapsule/server-sdk/dist/cjs/workers/worker';

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
