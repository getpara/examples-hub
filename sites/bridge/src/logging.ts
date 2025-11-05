import log from 'loglevel';

log.setDefaultLevel('info');

export const logger = log.getLogger('bridge');

export const formatError = (error: any): string => {
  try {
    if (error instanceof Error) {
      return JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};
