import { Ctx, getPortalBaseURL } from '@getpara/core-sdk';
import { handleMessage } from './worker.js';

export interface SyncWorker {
  postMessage: (message: any) => void;
  terminate: () => void;
}

const CLEAR_WORKER_TIMEOUT_MS = 1000 * 90;

let workerInstance: Worker | undefined;
const resFunctionMap: Record<
  string,
  {
    fn: (arg: any) => Promise<void>;
    errorFn?: (error: Error) => void;
    timeoutId: NodeJS.Timeout;
    errorContext: object;
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
  errorFunction: (err: Error) => void,
  workId: string,
  errorContext?: object,
): Promise<Worker | SyncWorker> {
  if (ctx.disableWorkers) {
    const syncWorker: SyncWorker = {
      postMessage: function (message) {
        (async function () {
          try {
            const onmessage = event => {
              resFunction(event.data);
            };
            await handleMessage({ data: message }, data => onmessage({ data }), ctx.disableWorkers);
          } catch (error) {
            errorFunction(error);
          }
        })();
      },
      terminate: () => {
        return;
      },
    };

    return syncWorker;
  }

  const timeoutId = setTimeout(() => {
    removeWorkId(workId, true);
  }, CLEAR_WORKER_TIMEOUT_MS);

  resFunctionMap[workId] = {
    fn: resFunction,
    timeoutId,
    errorFn: errorFunction,
    errorContext: errorContext || {},
  };

  if (ctx.useLocalFiles) {
    // worker = new Worker(new URL('./worker.ts', import.meta.url));
    throw new Error('useLocalFiles only supported locally');
  } else if (!workerInstance) {
    const workerRes = await fetch(`${getPortalBaseURL(ctx)}/static/js/mpcWorker-bundle.js`);
    const workerBlob = new Blob([await workerRes.text()], { type: 'application/javascript' });
    const workerScriptURL = URL.createObjectURL(workerBlob);
    workerInstance = new Worker(workerScriptURL);

    const onmessage = async (event: { data: { functionType: string; params: any; workId: string } }) => {
      const { workId: messageWorkId } = event.data;
      delete event.data.workId;

      if (messageWorkId && resFunctionMap[messageWorkId]) {
        await resFunctionMap[messageWorkId].fn(event.data);
        removeWorkId(messageWorkId);
      }
    };
    workerInstance.onmessage = onmessage;
    workerInstance.onerror = err => {
      console.error('worker error:', err);
      Object.keys(resFunctionMap).forEach(id => {
        if (resFunctionMap[id]) {
          const errorMsg = `worker error with workId ${id} and opts ${JSON.stringify(resFunctionMap[id].errorContext)}: ${err.message}`;
          resFunctionMap[id].errorFn(new Error(errorMsg));
          removeWorkId(id);
        }
      });
      workerInstance?.terminate();
      workerInstance = undefined;
    };
  }

  return workerInstance;
}
