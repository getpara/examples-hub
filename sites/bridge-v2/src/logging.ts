import log from 'loglevel';

// Force loglevel to use the original console methods
log.setDefaultLevel('debug');
log.setLevel('debug');

// Ensure loglevel uses console methods that can be intercepted
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (...args) {
    // Convert to string to handle symbol types
    const methodStr = String(methodName);
    const loggerStr = String(loggerName);
    // Use the original console methods directly
    if (methodStr === 'debug' || methodStr === 'info') {
      // eslint-disable-next-line no-console
      console.log(`[${loggerStr}:${methodStr}]`, ...args);
    } else if (methodStr === 'warn') {
      console.warn(`[${loggerStr}:${methodStr}]`, ...args);
    } else if (methodStr === 'error') {
      console.error(`[${loggerStr}:${methodStr}]`, ...args);
    } else {
      // eslint-disable-next-line no-console
      console.log(`[${loggerStr}:${methodStr}]`, ...args);
    }
    // Also call the original method
    rawMethod(...args);
  };
};

// Rebuild the methods with our custom factory
log.rebuild();

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
  } catch (e) {
    return String(error);
  }
};
