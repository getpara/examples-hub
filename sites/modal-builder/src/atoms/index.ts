// src/atoms/index.ts
import { atom, WritableAtom } from 'jotai';
import { Environment, CapsuleWeb } from '@usecapsule/react-sdk';
import qs from 'qs';
import merge from 'lodash.merge';
import { getModalCodeString } from '../utils/codeGenerator';
import { ModalBuilderConfig, ViewType } from '../types';
import { MODAL_BUILDER_DEFAULT_CONFIG, CAPSULE_API_KEY } from '../constants';
import { logDebug, logError } from '../utils/';

export const modalConfigAtom = atom<ModalBuilderConfig>(MODAL_BUILDER_DEFAULT_CONFIG);
export const viewAtom = atom<ViewType>('desktop');
export const isLoggedInAtom = atom<boolean>(false);
export const capsuleClientAtom = atom<CapsuleWeb>(new CapsuleWeb(Environment.BETA, CAPSULE_API_KEY));

export const initializeConfigAtom: WritableAtom<null, [null], void> = atom(null, (_, set) => {
  const searchParams = new URLSearchParams(window.location.search);
  const searchParamsString = searchParams.toString();
  try {
    const parsedParams = qs.parse(searchParamsString, {
      allowDots: true,
      depth: 10,
      arrayLimit: 100,
    });
    logDebug('Parsed query parameters:', parsedParams);

    const parseBooleanRecursive = (obj: any): any => {
      if (typeof obj === 'string') {
        if (obj === 'true') return true;
        if (obj === 'false') return false;
      }
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(parseBooleanRecursive);
      return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, parseBooleanRecursive(value)]));
    };

    const parsedParamsBoolean = parseBooleanRecursive(parsedParams);

    logDebug('Parsed query parameters:', parsedParamsBoolean);

    const mergedConfig: ModalBuilderConfig = merge(MODAL_BUILDER_DEFAULT_CONFIG, parsedParamsBoolean);
    logDebug('Merged configuration:', mergedConfig);
    set(modalConfigAtom, mergedConfig);
  } catch (error) {
    logError('Failed to parse query parameters:', error);
    set(modalConfigAtom, MODAL_BUILDER_DEFAULT_CONFIG);
  }
});

const createConfigSectionAtom = <T extends keyof ModalBuilderConfig>(sectionKey: T) => {
  return atom(
    get => get(modalConfigAtom)[sectionKey],
    (_, set, update: Partial<ModalBuilderConfig[T]>) => {
      logDebug(`Updating ${sectionKey} configuration with:`, update);
      set(modalConfigAtom, prev => {
        const newConfig = {
          ...prev,
          [sectionKey]: { ...prev[sectionKey], ...update },
        };
        logDebug('New modal configuration after update:', newConfig);
        syncUrlWithConfig(newConfig);
        return newConfig;
      });
    },
  );
};

export const appearanceConfigAtom = createConfigSectionAtom('appearance');
export const networksConfigAtom = createConfigSectionAtom('networks');
export const authenticationConfigAtom = createConfigSectionAtom('authentication');
export const securityConfigAtom = createConfigSectionAtom('security');
export const onRampsConfigAtom = createConfigSectionAtom('onRamps');
export const offRampsConfigAtom = createConfigSectionAtom('offRamps');
export const depositCryptoConfigAtom = createConfigSectionAtom('depositCrypto');

export const resetConfigAtom: WritableAtom<void, [null], void> = atom(null, (_, set) => {
  try {
    set(modalConfigAtom, MODAL_BUILDER_DEFAULT_CONFIG);
    set(viewAtom, 'desktop');
    logDebug('Configuration reset to default:', MODAL_BUILDER_DEFAULT_CONFIG);
    window.history.replaceState(null, '', window.location.pathname);
  } catch (error) {
    logError('Failed to reset configuration:', error);
  }
});

export const getShareUrlAtom = atom<string>(get => {
  const config = get(modalConfigAtom);
  const queryString = qs.stringify(config, {
    encode: true,
    addQueryPrefix: false,
    arrayFormat: 'brackets',
  });
  const shareUrl = `${window.location.origin}${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
  logDebug('Generated share URL:', shareUrl);
  return shareUrl;
});

export const copyShareUrlAtom: WritableAtom<void, [null], Promise<void>> = atom(null, async (_get, _set) => {
  const url = window.location.origin + window.location.pathname + window.location.search;
  try {
    await navigator.clipboard.writeText(url);
  } catch (err) {
    logError('Failed to copy URL:', err);
  }
});

export const getCodeStringAtom = atom<string>(get => {
  const config = get(modalConfigAtom);
  const codeString = getModalCodeString(config);
  logDebug('Generated code string:', codeString);
  return codeString;
});

export const checkLoginStatusAtom: WritableAtom<void, [null], Promise<void>> = atom(null, async (get, set) => {
  const capsuleClient = get(capsuleClientAtom);
  try {
    const loggedIn = await capsuleClient.isFullyLoggedIn();
    set(isLoggedInAtom, loggedIn);
    logDebug('Login status checked:', loggedIn);
  } catch (error) {
    logError('Error checking login status:', error);
    set(isLoggedInAtom, false);
  }
});

export const initializeAppAtom: WritableAtom<void, [unknown], void> = atom(null, (_get, set) => {
  try {
    logDebug('Initializing atom state');
    set(initializeConfigAtom, null);
    set(checkLoginStatusAtom, null);
  } catch (error) {
    logError('Failed to initialize application:', error);
  }
});

const syncUrlWithConfig = (config: ModalBuilderConfig) => {
  try {
    const queryString = qs.stringify(config, {
      encode: true,
      addQueryPrefix: false,
      arrayFormat: 'brackets',
    });
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    window.history.replaceState(null, '', newUrl);
    logDebug('URL synchronized with config:', newUrl);
  } catch (error) {
    logError('Failed to synchronize URL with config:', error);
  }
};
