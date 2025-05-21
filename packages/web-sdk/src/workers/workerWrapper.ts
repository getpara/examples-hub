import { Ctx, getPortalBaseURL } from '@getpara/core-sdk';
import { handleMessage } from './worker.js';

export interface SyncWorker {
  postMessage: (message: any) => void;
  terminate: () => void;
}

export async function setupWorker(
  ctx: Ctx,
  resFunction: (arg: any) => void,
  errorFunction: (err: Error) => void,
): Promise<Worker | SyncWorker> {
  const onmessage = event => {
    if (event.data.functionType === 'CUSTOM') {
      // safe to remove this block once this code is live in prod!
      return;
    }
    resFunction(event.data);
  };

  const onerror = (error: ErrorEvent | Error) => {
    errorFunction(error as Error);
  };

  if (ctx.disableWorkers) {
    const syncWorker: SyncWorker = {
      postMessage: function (message) {
        (async function () {
          try {
            await handleMessage({ data: message }, data => onmessage({ data }), ctx.disableWorkers);
          } catch (error) {
            onerror(error);
          }
        })();
      },
      terminate: () => {
        return;
      },
    };

    return syncWorker;
  }

  // Don't wrap this in try-catch so that setup errors are thrown directly
  let worker: Worker;
  if (ctx.useLocalFiles) {
    // worker = new Worker(new URL('./worker.ts', import.meta.url));
    throw new Error('useLocalFiles only supported locally');
  } else {
    const workerRes = await fetch(`${getPortalBaseURL(ctx)}/static/js/mpcWorker-bundle.js`);
    const workerBlob = new Blob([await workerRes.text()], { type: 'application/javascript' });
    const workerScriptURL = URL.createObjectURL(workerBlob);
    worker = new Worker(workerScriptURL);
  }

  worker.onmessage = onmessage;
  worker.onerror = onerror;

  return worker;
}
