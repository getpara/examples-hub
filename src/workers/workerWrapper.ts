export function setupWorker(resFunction: (arg: any) => void, customFunction?: Function): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url));
  worker.onmessage = (event) => {
    if (event.data.functionType === 'CUSTOM' && customFunction) {
      customFunction(event.data.params);
      return;
    }
    resFunction(event.data);
  };
  return worker;
}
