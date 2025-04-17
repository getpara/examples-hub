import { atom, WritableAtom } from 'jotai';
import { getClient, TOAuthMethod } from '@getpara/react-sdk';
import qs from 'qs';
import merge from 'lodash.merge';
import { getModalCodeString } from '../utils/codeGenerator';
import { ModalBuilderConfig, ViewType, ExternalWallet, TAuthLayout } from '../types';
import { MODAL_BUILDER_DEFAULT_CONFIG } from '../constants';
import { logError } from '../utils/';

export const modalConfigAtom = atom<ModalBuilderConfig>(MODAL_BUILDER_DEFAULT_CONFIG);
export const viewAtom = atom<ViewType>('desktop');
export const isLoggedInAtom = atom<boolean>(false);

interface PreviousWeb2State {
  oAuthMethods: TOAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  authLayoutWeb2?: TAuthLayout;
}
interface PreviousWeb3State {
  externalWallets: ExternalWallet[];
  authLayoutWeb3?: TAuthLayout;
}

export const previousWeb2StateAtom = atom<PreviousWeb2State | null>(null);
export const previousWeb3StateAtom = atom<PreviousWeb3State | null>(null);

export const initializeConfigAtom: WritableAtom<null, [null], void> = atom(null, (_, set) => {
  const searchParams = new URLSearchParams(window.location.search);
  const searchParamsString = searchParams.toString();
  try {
    const parsedParams = qs.parse(searchParamsString, {
      allowDots: true,
      depth: 10,
      arrayLimit: 100,
    });

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

    const mergedConfig: ModalBuilderConfig = merge(MODAL_BUILDER_DEFAULT_CONFIG, parsedParamsBoolean);
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
      set(modalConfigAtom, prev => {
        const newConfig = {
          ...prev,
          [sectionKey]: { ...prev[sectionKey], ...update },
        };
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
export const walletsConfigAtom = createConfigSectionAtom('wallets');

export const resetConfigAtom: WritableAtom<void, [null], void> = atom(null, (_, set) => {
  try {
    set(modalConfigAtom, MODAL_BUILDER_DEFAULT_CONFIG);
    set(viewAtom, 'desktop');
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
  return codeString;
});

export const checkLoginStatusAtom: WritableAtom<void, [null], Promise<void>> = atom(null, async (_, set) => {
  const para = getClient();
  try {
    const loggedIn = await para?.isFullyLoggedIn();
    set(isLoggedInAtom, !!loggedIn);
  } catch (error) {
    logError('Error checking login status:', error);
    set(isLoggedInAtom, false);
  }
});

export const initializeAppAtom: WritableAtom<void, [unknown], void> = atom(null, (_get, set) => {
  try {
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
  } catch (error) {
    logError('Failed to synchronize URL with config:', error);
  }
};
