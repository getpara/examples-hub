import { Worker } from 'worker_threads';
import * as path from 'path';
import { pathToFileURL } from 'url';

export async function setupWorker(resFunction: (arg: any) => Promise<void>, customFunction?: (params?: any) => void): Promise<Worker> {
  const relativePath = './worker.js';
  const absolutePath = path.join(__dirname, relativePath);
  const workerURL = pathToFileURL(absolutePath);
  const worker = new Worker(workerURL);

  const onmessage = async (message: { functionType: string; params: any }) => {
    if (message.functionType === 'CUSTOM' && customFunction) {
      customFunction(message.params);
      return;
    }
    await resFunction(message);
    worker.postMessage('SHUTDOWN');
  };

  worker.on('message', onmessage);
  worker.on('error', (err) => {
    throw err;
  });
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(new Error(`worker stopped with exit code: ${code}`));
    }
  });
  return worker;
}
