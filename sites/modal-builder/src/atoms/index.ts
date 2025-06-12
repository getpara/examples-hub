import { atom, WritableAtom } from 'jotai';
import qs from 'qs';
import merge from 'lodash.merge';
import debounce from 'lodash.debounce';
import { getModalCodeString } from '../utils/codeGenerator';
import { ModalBuilderConfig, ViewType, ExternalWallet, TAuthLayout } from '../types';
import { MODAL_BUILDER_DEFAULT_CONFIG } from '../constants';
import { logError } from '../utils';
import { getModalConfigDiff } from '../utils/configDiff';
import {
  compressConfigDiff,
  decompressConfigDiff,
  encodeCompressedConfig,
  decodeCompressedConfig,
} from '../utils/urlCompression';

export const modalConfigAtom = atom<ModalBuilderConfig>(MODAL_BUILDER_DEFAULT_CONFIG);
export const viewAtom = atom<ViewType>('desktop');

interface PreviousWeb2State {
  oAuthMethods: any[];
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
  const encodedConfig = searchParams.get('c');
  try {
    let configDiff: Partial<ModalBuilderConfig> | null = null;

    if (encodedConfig) {
      const compressed = decodeCompressedConfig(encodedConfig);
      if (compressed) configDiff = decompressConfigDiff(compressed);
    } else {
      const parsedParams = qs.parse(searchParams.toString(), { allowDots: true, depth: 10, arrayLimit: 100 });
      const parsedParamsBoolean = JSON.parse(JSON.stringify(parsedParams), (_k, v) => {
        if (v === 'true') return true;
        if (v === 'false') return false;
        if (v === '1') return 1;
        if (v === '0') return 0;
        return v;
      });
      configDiff = decompressConfigDiff(parsedParamsBoolean);
    }

    const mergedConfig = merge({}, MODAL_BUILDER_DEFAULT_CONFIG, configDiff || {});
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
        const newConfig = { ...prev, [sectionKey]: { ...prev[sectionKey], ...update } };
        debouncedSyncUrlWithConfig(newConfig);
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
  const compressed = compressConfigDiff(diff);
  const encoded = encodeCompressedConfig(compressed);
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
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    const compressed = compressConfigDiff(diff);
    const encoded = encodeCompressedConfig(compressed);
    const newUrl = `${window.location.pathname}?c=${encoded}`;
    window.history.replaceState(null, '', newUrl);
  } catch (error) {
    logError('Failed to synchronize URL with config:', error);
  }
};

const debouncedSyncUrlWithConfig = debounce(syncUrlWithConfig, 150);
