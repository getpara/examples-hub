import { readFile } from 'fs/promises';

export const getWorkerContent = async (): Promise<string> => await readFile(`${__dirname}/worker.min.js`, 'utf8');
