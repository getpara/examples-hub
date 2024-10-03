import log from 'loglevel';

if (import.meta.env.MODE === 'development') {
  log.setLevel('debug');
} else {
  log.setLevel('error');
}

export const logDebug = (message: string, ...optionalParams: any[]) => {
  log.debug(message, ...optionalParams);
};

export const logError = (error: Error | string, ...optionalParams: any[]) => {
  log.error(error, ...optionalParams);
};

export const logWarn = (message: string, ...optionalParams: any[]) => {
  log.warn(message, ...optionalParams);
};

export const logInfo = (message: string, ...optionalParams: any[]) => {
  log.info(message, ...optionalParams);
};

export const logTrace = (message: string, ...optionalParams: any[]) => {
  log.trace(message, ...optionalParams);
};
