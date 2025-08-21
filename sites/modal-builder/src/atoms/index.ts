import { atom, WritableAtom } from 'jotai';
import { TExternalWallet, TOAuthMethod } from '@getpara/react-sdk';
import mergeWith from 'lodash.mergewith';
import debounce from 'lodash.debounce';
import { getModalCodeString } from '../utils/codeGenerator';
import { ModalBuilderConfig, ViewType, TAuthLayout } from '../types';
import { MODAL_BUILDER_DEFAULT_CONFIG } from '../constants';
import { logError } from '../utils';
import { getModalConfigDiff } from '../utils/configDiff';
import { encodeConfig, decodeConfig } from '../utils/urlCompression';
import { validateConfigDiff } from '../utils/configValidation';

const baseModalConfigAtom = atom<ModalBuilderConfig>(MODAL_BUILDER_DEFAULT_CONFIG);

export const modalConfigAtom = atom(
  get => get(baseModalConfigAtom),
  (get, set, newValue: ModalBuilderConfig | ((prev: ModalBuilderConfig) => ModalBuilderConfig)) => {
    const prevValue = get(baseModalConfigAtom);
    const nextValue = typeof newValue === 'function' ? newValue(prevValue) : newValue;

    set(baseModalConfigAtom, nextValue);
  },
);
export const viewAtom = atom<ViewType>('desktop');

interface PreviousWeb2State {
  oAuthMethods: TOAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  authLayoutWeb2?: TAuthLayout;
}
interface PreviousWeb3State {
  externalWallets: TExternalWallet[];
  authLayoutWeb3?: TAuthLayout;
}

export const previousWeb2StateAtom = atom<PreviousWeb2State | null>(null);
export const previousWeb3StateAtom = atom<PreviousWeb3State | null>(null);

// Flag to track initialization state
let isInitializing = false;

export const initializeConfigAtom: WritableAtom<null, [null], void> = atom(null, (_, set) => {
  isInitializing = true;
  const searchParams = new URLSearchParams(window.location.search);
  const encodedConfig = searchParams.get('c');
  try {
    let configDiff: Partial<ModalBuilderConfig> | null = null;

    if (encodedConfig) {
      const decoded = decodeConfig(encodedConfig);
      if (decoded) {
        configDiff = validateConfigDiff(decoded);
        if (!configDiff) {
          logError('Invalid configuration in URL, using defaults');
        }
      }
    }

    const mergedConfig = configDiff
      ? mergeWith({}, MODAL_BUILDER_DEFAULT_CONFIG, configDiff, (_objValue: any, srcValue: any) => {
          if (Array.isArray(srcValue)) {
            return srcValue;
          }
          return undefined;
        })
      : MODAL_BUILDER_DEFAULT_CONFIG;
    set(modalConfigAtom, mergedConfig);
  } catch (error) {
    logError('Failed to parse query parameters:', error);
    set(modalConfigAtom, MODAL_BUILDER_DEFAULT_CONFIG);
  } finally {
    setTimeout(() => {
      isInitializing = false;
    }, 100);
  }
});

const createConfigSectionAtom = <T extends keyof ModalBuilderConfig>(sectionKey: T) => {
  return atom(
    get => get(modalConfigAtom)[sectionKey],
    (_get, set, update: Partial<ModalBuilderConfig[T]>) => {
      set(modalConfigAtom, prev => {
        const newConfig = { ...prev, [sectionKey]: { ...prev[sectionKey], ...update } };

        if (!isInitializing) {
          debouncedSyncUrlWithConfig(newConfig);
        }
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
  const diff = getModalConfigDiff(config, MODAL_BUILDER_DEFAULT_CONFIG);
  if (!diff) return `${window.location.origin}${window.location.pathname}`;
  const encoded = encodeConfig(diff);
  return `${window.location.origin}${window.location.pathname}?c=${encoded}`;
});

export const copyShareUrlAtom: WritableAtom<void, [null], Promise<void>> = atom(null, async (_get, _set) => {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch (err) {
    logError('Failed to copy URL:', err);
  }
});

export const getCodeStringAtom = atom<string>(get => getModalCodeString(get(modalConfigAtom)));

export const initializeAppAtom: WritableAtom<void, [unknown], void> = atom(null, (_get, set) => {
  set(initializeConfigAtom, null);
});

const syncUrlWithConfig = (config: ModalBuilderConfig) => {
  try {
    const diff = getModalConfigDiff(config, MODAL_BUILDER_DEFAULT_CONFIG);
    if (!diff) {
      if (window.location.search !== '') {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return;
    }
    const encoded = encodeConfig(diff);
    const newSearch = `?c=${encoded}`;

    if (window.location.search !== newSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
    }
  } catch (error) {
    logError('Failed to synchronize URL with config:', error);
  }
};

const debouncedSyncUrlWithConfig = debounce(syncUrlWithConfig, 150);
