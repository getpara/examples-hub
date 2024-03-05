import { Worker } from 'worker_threads';
import * as path from 'path';
import { pathToFileURL } from 'url';

const RELATIVE_WORKER_PATH = './worker.js';
const absolutePath = path.join(__dirname, RELATIVE_WORKER_PATH);
const workerURL = pathToFileURL(absolutePath);
let worker: Worker | undefined;

export async function setupWorker(resFunction: (arg: any) => Promise<void>): Promise<Worker> {
  if (!worker || !worker.threadId) {
    worker = new Worker(workerURL);
  }

  const onmessage = async (message: { functionType: string; params: any }) => {
    if (message.functionType === 'CUSTOM') {
      // safe to remove this block once worker-bundle file is updated in prod!
      return;
    }

    await resFunction(message);
  };

  worker.removeAllListeners()
  worker.on('message', onmessage);
  worker.on('error', (err) => {
    throw err;
  });
  worker.on('exit', (code) => {
    console.error(`worker stopped with exit code ${code}`);
  });
  return worker;
}
