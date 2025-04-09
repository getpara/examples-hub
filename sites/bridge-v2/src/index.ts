import { ParaWeb, Environment, CoreMethodName, PARA_CORE_METHODS } from '@getpara/web-sdk';
import { logger, formatError } from './logging';
import { coreMethodHandlers, bridgeMethodHandlers } from './bridgeMethodHandlers';
import { BridgeResponse, Platform } from './types';

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
    logger.info('Received message from event:', event.data);
    const data = event.data;
    const requestId = data['requestId'];

    switch (data['messageType']) {
      case 'Capsule#init':
      case 'Para#init': {
        logNetworkInformation();
        logger.info('Initializing Para with args:', data['arguments']);
        const initArgs = data['arguments'] ?? {};
        initPara(initArgs['environment'], initArgs['apiKey']);
        platform = Platform[initArgs['platform'] as keyof typeof Platform] ?? Platform.flutter;
        version = initArgs['version'];
        logger.info('Para initialized successfully. Platform:', platform, 'Version:', version);
        sendResponse(data['messageType'], requestId, true);
        break;
      }
      case 'Capsule#invokeMethod':
      case 'Para#invokeMethod':
        logger.info('Invoking method:', data['methodName'], 'with args:', data['arguments']);
        invokeParaMethod(data['methodName'], data['arguments'], requestId);
        break;
      default:
        logger.warn('Unknown message type:', data['messageType']);
        break;
    }
  } catch (err) {
    const errStr = formatError(err);
    logger.error('Error in message event listener:', errStr);
  }
});

function sendResponse(method: string, requestId: string, responseData: any, error?: string) {
  const payload: BridgeResponse = { method, requestId, responseData, error };
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

function initPara(environment: string, apiKey: string) {
  try {
    if (window['para'] != null) {
      throw new Error('Para already initialized');
    }
    const para = new ParaWeb(environment as Environment, apiKey, {
      disableWorkers: false,
      disableWebSockets: false, // should this be true?
    });

    para.init();
    window['para'] = para;
  } catch (err) {
    const errStr = formatError(err);
    logger.error('Error initializing Para:', errStr);
    throw err;
  }
}

async function invokeParaMethod(methodName: string, args: any[], requestId: string) {
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
