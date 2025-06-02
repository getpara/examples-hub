import { Bun, Deno, Expo, Flutter, Next, Node, React, Svelte, Swift, Vite, Vue } from '@getpara/react-component-library';
import { Framework } from '../types/framework';
import { REACT_CODE_SNIPPET, REACT_CODE_SNIPPET_1_X_X, SERVER_CODE_SNIPPET, WEB_CODE_SNIPPET } from './codeSnippets';
import {
  EXPO_DOCS_LINK,
  EXPO_SETUP_DOCS_LINK,
  FLUTTER_DOCS_LINK,
  FLUTTER_SETUP_DOCS_LINK,
  NEXT_EXTRA_DOCS_LINK,
  NODE_DOCS_LINK,
  REACT_DOCS_LINK,
  REACT_NATIVE_DOCS_LINK,
  REACT_NATIVE_SETUP_DOCS_LINK,
  SWIFT_DOCS_LINK,
  VITE_EXTRA_DOCS_LINK,
  WEB_DOCS_LINK,
} from './constants';

export const frameworkHasPackageManager: Record<Framework, boolean> = {
  [Framework.REACT]: true,
  [Framework.NEXT]: true,
  [Framework.VITE]: true,
  [Framework.VUE]: true,
  [Framework.SVELTE]: true,
  [Framework.NODE]: true,
  [Framework.REACT_NATIVE]: true,
  [Framework.EXPO]: true,
  [Framework.FLUTTER]: false,
  [Framework.SWIFT]: false,
  [Framework.DENO]: true,
  [Framework.BUN]: true,
};

export const formatFrameworkName = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT: {
      return 'React';
    }
    case Framework.NEXT: {
      return 'Next.js';
    }
    case Framework.VITE: {
      return 'Vite';
    }
    case Framework.REACT_NATIVE: {
      return 'React Native';
    }
    case Framework.EXPO: {
      return 'Expo';
    }
    case Framework.FLUTTER: {
      return 'Flutter';
    }
    case Framework.SWIFT: {
      return 'Swift';
    }
    case Framework.NODE: {
      return 'Node.js';
    }
    case Framework.VUE: {
      return 'Vue.js';
    }
    case Framework.SVELTE: {
      return 'Svelte';
    }
    case Framework.DENO: {
      return 'Deno';
    }
    case Framework.BUN: {
      return 'Bun';
    }
    default: {
      return '';
    }
  }
};

export const getFrameworkDocsLink = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    default:
    case Framework.REACT:
    case Framework.VITE:
    case Framework.NEXT: {
      return REACT_DOCS_LINK;
    }
    case Framework.SVELTE:
    case Framework.VUE: {
      return WEB_DOCS_LINK;
    }
    case Framework.REACT_NATIVE: {
      return REACT_NATIVE_DOCS_LINK;
    }
    case Framework.EXPO: {
      return EXPO_DOCS_LINK;
    }
    case Framework.FLUTTER: {
      return FLUTTER_DOCS_LINK;
    }
    case Framework.SWIFT: {
      return SWIFT_DOCS_LINK;
    }
    case Framework.NODE:
    case Framework.DENO:
    case Framework.BUN: {
      return NODE_DOCS_LINK;
    }
  }
};

export const getFrameworkNativePasskeyDocsLink = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.FLUTTER: {
      return FLUTTER_SETUP_DOCS_LINK;
    }
    case Framework.EXPO: {
      return EXPO_SETUP_DOCS_LINK;
    }
    case Framework.REACT_NATIVE: {
      return REACT_NATIVE_SETUP_DOCS_LINK;
    }
    default: {
      return undefined;
    }
  }
};

export const getFrameworkExtraSetupLink = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT:
    case Framework.SVELTE:
    case Framework.VUE:
    case Framework.NODE:
    case Framework.DENO:
    case Framework.BUN: {
      return undefined;
    }
    case Framework.VITE: {
      return VITE_EXTRA_DOCS_LINK;
    }
    case Framework.NEXT: {
      return NEXT_EXTRA_DOCS_LINK;
    }
    case Framework.REACT_NATIVE: {
      return REACT_NATIVE_DOCS_LINK;
    }
    case Framework.EXPO: {
      return EXPO_DOCS_LINK;
    }
    case Framework.FLUTTER: {
      return FLUTTER_DOCS_LINK;
    }
    case Framework.SWIFT: {
      return SWIFT_DOCS_LINK;
    }
    default: {
      return undefined;
    }
  }
};

export const getFrameworkPackages = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT:
    case Framework.VITE:
    case Framework.NEXT: {
      return '@getpara/react-sdk';
    }
    case Framework.REACT_NATIVE: {
      return '@getpara/react-native-wallet @usecapsule/react-native-passkey @react-native-async-storage/async-storage  react-native-get-random-values react-native-inappbrowser-reborn react-native-keychain react-native-modpow react-native-quick-base64 react-native-quick-crypto react-native-webview react-native-webview-crypto node-libs-react-native node-forge readable-stream text-encoding';
    }
    case Framework.EXPO: {
      return '@getpara/react-native-wallet @usecapsule/react-native-passkey @react-native-async-storage/async-storage  @craftzdog/react-native-buffer expo-crypto react-native-get-random-values react-native-inappbrowser-reborn react-native-keychain react-native-modpow react-native-quick-base64 react-native-quick-crypto react-native-webview react-native-webview-crypto node-libs-react-native node-forge readable-stream text-encoding';
    }
    case Framework.FLUTTER: {
      return 'flutter pub add capsule';
    }
    case Framework.SWIFT: {
      return 'Follow the steps in the Install Guide.';
    }
    case Framework.NODE:
    case Framework.DENO:
    case Framework.BUN: {
      return '@getpara/server-sdk';
    }
    case Framework.SVELTE:
    case Framework.VUE: {
      return '@getpara/web-sdk';
    }
    default: {
      return '';
    }
  }
};

export const getFrameworkVersions = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT:
    case Framework.VITE:
    case Framework.NEXT: {
      return [
        { label: '1.x.x', value: '1.x.x' },
        { label: 'Alpha 2.0', value: 'alpha' },
      ];
    }
    default: {
      return undefined;
    }
  }
};

export const getFrameworkCodeSnippet = (framework?: Framework, version?: string) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT:
    case Framework.VITE:
    case Framework.NEXT: {
      if (version === '1.x.x') {
        return REACT_CODE_SNIPPET_1_X_X;
      }

      return REACT_CODE_SNIPPET;
    }
    case Framework.SWIFT:
    case Framework.FLUTTER:
    case Framework.EXPO:
    case Framework.REACT_NATIVE: {
      return undefined;
    }
    case Framework.NODE:
    case Framework.DENO:
    case Framework.BUN: {
      return SERVER_CODE_SNIPPET;
    }
    case Framework.SVELTE:
    case Framework.VUE: {
      return WEB_CODE_SNIPPET;
    }
    default: {
      return undefined;
    }
  }
};

export const getFrameworkIcon = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT:
    case Framework.REACT_NATIVE:
      return React;
    case Framework.NEXT:
      return Next;
    case Framework.SWIFT:
      return Swift;
    case Framework.FLUTTER:
      return Flutter;
    case Framework.SVELTE:
      return Svelte;
    case Framework.VUE:
      return Vue;
    case Framework.BUN:
      return Bun;
    case Framework.DENO:
      return Deno;
    case Framework.VITE:
      return Vite;
    case Framework.EXPO:
      return Expo;
    case Framework.NODE:
      return Node;
    default:
      return null;
  }
};

export const getFrameworkColors = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT:
    case Framework.REACT_NATIVE:
    case Framework.FLUTTER:
      return { bg: 'para:bg-sky-50', border: 'para:border-sky-600' };
    case Framework.NEXT:
    case Framework.DENO:
    case Framework.EXPO:
      return { bg: 'para:bg-neutral-50', border: 'para:border-neutral-600' };
    case Framework.SWIFT:
    case Framework.SVELTE:
      return { bg: 'para:bg-orange-50', border: 'para:border-orange-600' };
    case Framework.VUE:
    case Framework.NODE:
      return { bg: 'para:bg-green-50', border: 'para:border-green-600' };
    case Framework.BUN:
      return { bg: 'para:bg-rose-50', border: 'para:border-rose-600' };
    case Framework.VITE:
      return { bg: 'para:bg-purple-50', border: 'para:border-purple-600' };
    default:
      return null;
  }
};

export const getIsFrameworkMobile = (framework?: Framework) => {
  switch (framework?.toUpperCase()) {
    case Framework.REACT_NATIVE:
    case Framework.EXPO:
    case Framework.FLUTTER:
    case Framework.SWIFT:
      return true;
    default:
      return false;
  }
};
