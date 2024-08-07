import { Worker } from 'worker_threads';
import * as path from 'path';
import { pathToFileURL } from 'url';

const CLEAR_WORKER_TIMEOUT_MS = 1000 * 90;
const RELATIVE_WORKER_PATH = './worker.js';
const absolutePath = path.join(__dirname, RELATIVE_WORKER_PATH);
const workerURL = pathToFileURL(absolutePath);
let worker: Worker | undefined;
const resFunctionMap: Record<
  string,
  {
    fn: (arg: any) => Promise<void>;
    timeoutId: NodeJS.Timeout;
  }
> = {};

function removeWorkId(workId: string, skipClearTimeout?: boolean) {
  const { timeoutId } = resFunctionMap[workId];
  delete resFunctionMap[workId];
  if (skipClearTimeout) {
    return;
  }
  clearTimeout(timeoutId);
}

export async function setupWorker(resFunction: (arg: any) => Promise<void>, workId: string): Promise<Worker> {
  const timeoutId = setTimeout(() => {
    removeWorkId(workId, true);
  }, CLEAR_WORKER_TIMEOUT_MS);
  resFunctionMap[workId] = {
    fn: resFunction,
    timeoutId,
  };

  if (!worker || !worker.threadId) {
    worker = new Worker(workerURL);

    const onmessage = async (message: { functionType: string; params: any; workId: string }) => {
      const { workId: messageWorkId } = message;
      delete message.workId;

      await resFunctionMap[messageWorkId].fn(message);
      removeWorkId(messageWorkId);
    };

    worker.on('message', onmessage);
    worker.on('error', err => {
      throw err;
    });
    worker.on('exit', code => {
      console.error(`worker stopped with exit code ${code}`);
    });
  }

  return worker;
}
