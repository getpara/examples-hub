import { Ctx, getPortalBaseURL } from '../definitions';
import { handleMessage } from './worker';

export interface SyncWorker {
  postMessage: (message: any) => void;
  terminate: () => void;
}

export async function setupWorker(ctx: Ctx, resFunction: (arg: any) => void, customFunction?: Function, useSyncWorker?: boolean): Promise<Worker | SyncWorker> {
  const onmessage = (event) => {
    if (event.data.functionType === 'CUSTOM' && customFunction) {
      customFunction(event.data.params);
      return;
    }
    resFunction(event.data);
  };

  if (ctx.disableWorkers) {
    const syncWorker: SyncWorker = {
      postMessage: function(message) {
        (async function() {
          await handleMessage({ data: message }, data => onmessage({ data }));
        })();
      },
      terminate: () => {},
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
