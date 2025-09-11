import { ParaWeb, Environment, CoreMethodName, PARA_CORE_METHODS } from '@getpara/web-sdk';
import { logger, formatError } from './logging';
import { coreMethodHandlers, bridgeMethodHandlers } from './bridgeMethodHandlers';
import {
  BridgeResponse,
  MessageArguments,
  Platform,
  BridgeError,
  BRIDGE_ERROR_CODES,
  normalizeError,
  reportError,
} from './types';
import { ParaBridge } from './classes/ParaBridge';

declare const __BRIDGE_COMMIT__: string;
logger.info(`Bridge loaded - commit: ${__BRIDGE_COMMIT__} at ${new Date().toISOString()}`);

let platform: Platform;
let version: string | undefined;

function logNetworkInformation() {
  try {
    logger.info('Logging network information...');
    logger.info(`navigator.onLine: ${navigator.onLine}`);

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) {
      logger.info('NetworkInformation API not supported.');
    } else {
      logger.info('Initial NetworkInformation:', {
        downlink: connection.downlink,
        downlinkMax: connection.downlinkMax,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
        type: connection.type,
      });

      connection.addEventListener('change', () => {
        logger.info('NetworkInformation changed:', {
          downlink: connection.downlink,
          downlinkMax: connection.downlinkMax,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
          type: connection.type,
        });
      });
    }

    window.addEventListener('online', () => {
      logger.info('Network connection restored. navigator.onLine:', navigator.onLine);
    });

    window.addEventListener('offline', () => {
      logger.info('Network connection lost. navigator.onLine:', navigator.onLine);
    });
  } catch (error) {
    logger.error('Error logging network information:', formatError(error));
  }
}

window.addEventListener('message', event => {
  try {
    logger.debug('Received message from event:', event.data);
    const data = event.data;

    switch (data.messageType) {
      case 'Para#init': {
        logger.info('Para#init received');
        logNetworkInformation();

        logger.info('Initializing Para with args:', data.arguments);

        try {
          initPara(data.arguments);
          logger.info('Para initialized successfully. Platform:', platform, 'Version:', version);
          sendResponse(data.messageType, data.requestId, true);
        } catch (error) {
          const bridgeError = normalizeError(error);
          logger.error('Para initialization failed:', bridgeError);
          // Report initialization errors
          reportError('Para#init', error, platform || Platform.flutter, version);
          sendResponse(data.messageType, data.requestId, null, bridgeError);
        }

        break;
      }
      case 'Para#invokeMethod':
        logger.info('Invoking method:', data.methodName, 'with args:', data.arguments);
        invokeParaMethod(data.methodName, data.arguments, data.requestId);
        break;
      default:
        logger.warn('Unknown message type:', data.messageType);
        break;
    }
  } catch (err) {
    const errStr = formatError(err);
    logger.error('Error in message event listener:', errStr);
  }
});

// Convert BigInt values to strings in the responseData to ensure serialization works
const convertBigIntsToStrings = (obj: any): any => {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  }
  if (obj && typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntsToStrings(value);
    }
    return converted;
  }
  return obj;
};

function sendResponse(method: string, requestId: string, responseData: any, error?: string | BridgeError) {
  const serializedResponseData = convertBigIntsToStrings(responseData);

  // Handle structured errors vs simple string errors
  let processedError: string | BridgeError | undefined = error;
  if (error && typeof error === 'object' && 'code' in error) {
    // It's a BridgeError - serialize it properly
    processedError = convertBigIntsToStrings(error) as BridgeError;
  }

  const payload: BridgeResponse = { method, requestId, responseData: serializedResponseData, error: processedError };
  logger.debug('Sending response:', payload);
  switch (platform) {
    case Platform.flutter:
      window['flutter_inappwebview'].callHandler('asyncResult', payload);
      break;
    case Platform.iOS:
      window['webkit'].messageHandlers.callback.postMessage(payload);
      break;
  }
}

function initPara({ environment, apiKey, isPasskeySupported, ...metadata }: MessageArguments<'Para#init'>) {
  logger.info('initPara called with:', { environment, apiKey, isPasskeySupported, metadata });
  try {
    if (window['para'] != null) {
      logger.warn('Para already initialized, aborting init.');
      throw new Error('Para already initialized');
    }

    logger.info('Creating ParaBridge instance...');
    const para = new ParaBridge(environment as Environment, apiKey, {
      disableWorkers: false,
      disableWebSockets: false,
      isPasskeySupported: isPasskeySupported === false ? false : true,
    });

    logger.info('Calling para.init()...');
    para.init();
    window['para'] = para;

    platform = Platform[metadata.platform ?? 'flutter'];
    version = metadata.version;
    logger.info('ParaBridge initialized. Platform:', platform, 'Version:', version);
  } catch (err) {
    logger.error('Para initialization failed:', err);
    throw err;
  }
}

async function invokeParaMethod(methodName: string, args: any, requestId: string) {
  try {
    const para = window['para'] as ParaWeb;
    const handler =
      PARA_CORE_METHODS.includes(methodName as CoreMethodName) && !!coreMethodHandlers[methodName]
        ? coreMethodHandlers[methodName]
        : bridgeMethodHandlers[methodName];

    if (!handler) {
      const error: BridgeError = {
        code: BRIDGE_ERROR_CODES.METHOD_NOT_IMPLEMENTED,
        message: `Method ${methodName} not implemented`,
      };

      logger.error(`Method not implemented: ${methodName}`);
      sendResponse(methodName, requestId, null, error);
      return;
    }

    const result = await handler(para, args);
    if (methodName === 'verifyWebChallenge') {
      sendResponse(methodName, requestId, platform === Platform.iOS ? result['data']['userId'] : result);
    } else {
      sendResponse(methodName, requestId, result);
    }
  } catch (error) {
    logger.error(`Error invoking method ${methodName}:`, error);
    logger.error(
      `Error details - type: ${typeof error}, constructor: ${error?.constructor?.name}, keys: ${Object.keys(error || {})}`,
    );
    // Report error to backend (non-blocking)
    reportError(methodName, error, platform, version);
    const normalizedError = normalizeError(error);
    logger.error(`Normalized error:`, normalizedError);
    sendResponse(methodName, requestId, null, normalizedError);
  }
}

window['open'] = function (url?: string | URL, target?: string, features?: string) {
  try {
    if (target != null || features != null) {
      throw new Error('target and features are not supported');
    }
    window['flutter_inappwebview'].callHandler('open', url);
    return window;
  } catch (err) {
    const errStr = formatError(err);
    logger.error('Error in window.open override:', errStr);
    throw err;
  }
};

export {};
