import { ParaWeb, Environment, CoreMethodName, PARA_CORE_METHODS } from '@getpara/web-sdk';
import { logger, formatError } from './logging';
import { coreMethodHandlers, bridgeMethodHandlers } from './bridgeMethodHandlers';
import { BridgeResponse, MessageArguments, Platform } from './types';
import { ParaBridge } from './classes/ParaBridge';

// Immediate console log to verify bridge is loaded
console.warn('[BRIDGE] Bridge script loaded at', new Date().toISOString());

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
    console.warn('[BRIDGE] Received message from event:', JSON.stringify(event.data, null, 2));
    logger.info('Received message from event:', event.data);
    const data = event.data;

    switch (data.messageType) {
      case 'Para#init': {
        console.warn('[BRIDGE] Para#init received');
        logNetworkInformation();

        console.warn('[BRIDGE] Initializing Para with args:', JSON.stringify(data.arguments, null, 2));
        logger.info('Initializing Para with args:', data.arguments);
        initPara(data.arguments);

        console.warn('[BRIDGE] Para initialized successfully. Platform:', platform, 'Version:', version);
        logger.info('Para initialized successfully. Platform:', platform, 'Version:', version);
        sendResponse(data.messageType, data.requestId, true);

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

function sendResponse(method: string, requestId: string, responseData: any, error?: string) {
  const serializedResponseData = convertBigIntsToStrings(responseData);
  const payload: BridgeResponse = { method, requestId, responseData: serializedResponseData, error };
  console.warn('[BRIDGE] Sending response:', JSON.stringify(payload, null, 2));
  logger.info('Sending response:', payload);
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
      disableWebSockets: false, // should this be true?
      isPasskeySupported: isPasskeySupported === false ? false : true,
    });

    logger.info('Calling para.init()...');
    para.init();
    window['para'] = para;

    platform = Platform[metadata.platform ?? 'flutter'];
    version = metadata.version;
    logger.info('ParaBridge initialized. Platform:', platform, 'Version:', version);
  } catch (err) {
    const errStr = formatError(err);
    logger.error('Error initializing Para:', errStr);
    throw err;
  }
}

async function invokeParaMethod(methodName: string, args: any, requestId: string) {
  const startTime = performance.now();
  try {
    const para = window['para'] as ParaWeb;
    const handler =
      PARA_CORE_METHODS.includes(methodName as CoreMethodName) && !!coreMethodHandlers[methodName]
        ? coreMethodHandlers[methodName]
        : bridgeMethodHandlers[methodName];

    if (!handler) {
      throw new Error(`Method ${methodName} not implemented`);
    }
    const result = await handler(para, args);
    if (methodName === 'verifyWebChallenge') {
      sendResponse(methodName, requestId, platform === Platform.iOS ? result['data']['userId'] : result);
    } else {
      sendResponse(methodName, requestId, result);
    }
  } catch (error) {
    const errorStr = formatError(error);
    logger.error(`Error invoking method ${methodName}:`, errorStr);
    sendResponse(methodName, requestId, null, errorStr);
  } finally {
    const endTime = performance.now();
    logger.info(`Method "${methodName}" took ${(endTime - startTime).toFixed(2)} ms to execute.`);
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
