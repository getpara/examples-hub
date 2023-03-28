export function setupWorker(resFunction: (arg: any) => void): Worker {
  const worker = new Worker(new URL('./worker.ts', import.meta.url));
  worker.onmessage = (event) => {
    resFunction(event.data);
  };
  return worker;
}
