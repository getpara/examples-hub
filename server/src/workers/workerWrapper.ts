import { Worker } from 'worker_threads';
import * as path from 'path';
import { pathToFileURL } from 'url';

export async function setupWorker(resFunction: (arg: any) => Promise<void>): Promise<Worker> {
  const relativePath = './worker.js';
  const absolutePath = path.join(__dirname, relativePath);
  const workerURL = pathToFileURL(absolutePath);
  const worker = new Worker(workerURL);

  const onmessage = async (message: { functionType: string; params: any }) => {
    if (message.functionType === 'CUSTOM') {
      // safe to remove this block once worker-bundle file is updated in prod!
      return;
    }

    await resFunction(message);
    await worker.terminate();
  };

  worker.on('message', onmessage);
  worker.on('error', (err) => {
    throw err;
  });
  return worker;
}
