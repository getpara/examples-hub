import { Worker } from 'worker_threads';
import { Ctx, getPortalBaseURL } from '@getpara/core-sdk';

const CLEAR_WORKER_TIMEOUT_MS = 1000 * 90;

let worker: Worker | undefined;
const resFunctionMap: Record<
  string,
  {
    fn: (arg: any) => Promise<void>;
    errorFn?: (error: Error) => void;
    timeoutId: NodeJS.Timeout;
    errorContext: object; // opts for the worker that will be logged on error
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

export async function setupWorker(
  ctx: Ctx,
  resFunction: (arg: any) => Promise<void>,
  errorFunction: (error: Error) => void,
  workId: string,
  errorContext: object,
): Promise<Worker> {
  const timeoutId = setTimeout(() => {
    if (resFunctionMap[workId]) {
      const errorMsg = `worker operation timed out after ${CLEAR_WORKER_TIMEOUT_MS}ms for workId ${workId} and opts ${JSON.stringify(resFunctionMap[workId].errorContext)}`;
      resFunctionMap[workId].errorFn(new Error(errorMsg));
      removeWorkId(workId, true);
    }
  }, CLEAR_WORKER_TIMEOUT_MS);

  resFunctionMap[workId] = {
    fn: resFunction,
    errorFn: errorFunction,
    timeoutId,
    errorContext,
  };

  if (!worker || !worker.threadId) {
    const workerRes = await fetch(`${getPortalBaseURL(ctx)}/static/js/mpcWorkerServer-bundle.js`);
    worker = new Worker(await workerRes.text(), { eval: true });

    const onmessage = async (message: { functionType: string; params: any; workId: string }) => {
      const { workId: messageWorkId } = message;
      if (!resFunctionMap[messageWorkId]) {
        console.warn(`received message for unknown workId: ${messageWorkId}`);
        return;
      }

      delete message.workId;

      try {
        await resFunctionMap[messageWorkId].fn(message);
        removeWorkId(messageWorkId);
      } catch (error) {
        console.error(`error in worker message handler for workId ${messageWorkId}:`, error);
        if (resFunctionMap[messageWorkId]) {
          resFunctionMap[messageWorkId].errorFn(error);
          removeWorkId(messageWorkId);
        }
      }
    };

    worker.on('message', onmessage);
    worker.on('error', err => {
      console.error('worker error:', err);
      Object.keys(resFunctionMap).forEach(id => {
        if (resFunctionMap[id]) {
          const errorMsg = `worker error with workId ${id} and opts ${JSON.stringify(resFunctionMap[id].errorContext)}: ${err.message}`;
          resFunctionMap[id].errorFn(new Error(errorMsg));
          removeWorkId(id);
        }
      });
    });
    worker.on('exit', code => {
      console.error(`worker stopped with exit code ${code}`);
      // Server workers should never exit
      Object.keys(resFunctionMap).forEach(id => {
        if (resFunctionMap[id]) {
          resFunctionMap[id].errorFn(new Error(`worker exited unexpectedly with code ${code}`));
          removeWorkId(id);
        }
      });
      worker = undefined;
    });
  }

  return worker;
}
