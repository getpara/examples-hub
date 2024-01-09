import { Ctx, getPortalBaseURL } from '../core/definitions';
import { handleMessage } from './worker';

export interface SyncWorker {
  postMessage: (message: any) => void;
  terminate: () => void;
}

export async function setupWorker(ctx: Ctx, resFunction: (arg: any) => void): Promise<Worker | SyncWorker> {
  const onmessage = (event) => {
    if (event.data.functionType === 'CUSTOM') {
      // safe to remove this block once this code is live in prod!
      return;
    }
    resFunction(event.data);
  };

  if (ctx.disableWorkers) {
    const syncWorker: SyncWorker = {
      postMessage: function(message) {
        (async function() {
          await handleMessage({ data: message }, data => onmessage({ data }), ctx.disableWorkers);
        })();
      },
      terminate: () => { return; },
    };

    return syncWorker;
  }

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
  return worker;
}
