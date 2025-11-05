import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import * as utils from '../../../utils/authLogin';
import { AuthLoginParams, GroupedWallets, LoginRes } from '../../../types';
import { usePara } from '../../../components/ParaContext';
import { CoreAuthInfo, entityToWallet, getPublicKeyHex, isWalletSupported, WalletEntity } from '@getpara/core-sdk';
import { formatISO } from 'date-fns';
import {
  AuthExtras,
  AuthInfo,
  AuthMethod,
  AuthParams,
  BiometricLocationHint,
  extractAuthInfo,
  ProfileBalance,
  TAuthMethod,
  TWalletType,
} from '@getpara/user-management-client';
import { useExtractedParams } from '../../../hooks/useExtractedParams';

const NOOP = () => {
  throw new Error();
};

type UpdateKeySharesOpts = {
  sessionId?: string;
  encryptionKey?: string;
};

type Login = {
  fns: {
    authLogin: () => Promise<Awaited<ReturnType<typeof utils.authLogin>>>;
    authLoginWithPassword: (
      password: string,
      isPIN?: boolean,
    ) => Promise<Awaited<ReturnType<typeof utils.authLoginWithPassword>>>;
    authUpdateKeyShares: (_: LoginRes, __?: UpdateKeySharesOpts) => Promise<void>;
    fetchWallets: () => Promise<GroupedWallets>;
    authUpdateEnclaveKeyShares: (_?: UpdateKeySharesOpts) => Promise<void>;
    checkIsEnclaveUser: () => Promise<boolean>;
    addAllEnclaveSharesForNewCredential: (sessionLookupId: string) => Promise<void>;
    addAllSharesForNewCredential: ({
      loginRes,
      sessionLookupId,
    }: {
      loginRes?: LoginRes;
      sessionLookupId: string;
    }) => Promise<void>;
    getSkipBasicLoginUpgradePromptPreference: () => Promise<boolean>;
  };
  authInfo?: AuthInfo | undefined;
  params: AuthLoginParams;
  authMethod?: TAuthMethod;
  isSwitchingWallets?: boolean;
  wallets?: GroupedWallets;
  biometricLocationHints?: BiometricLocationHint[];
  sessionOrigin?: string;
  loginRes?: LoginRes;
  balances?: ProfileBalance;
};

export const NO_DATE = formatISO(new Date(-8640000000000000));

export const LoginContext = createContext<Login>({
  fns: {
    authLogin: NOOP,
    authLoginWithPassword: NOOP,
    authUpdateKeyShares: NOOP,
    fetchWallets: NOOP,
    authUpdateEnclaveKeyShares: NOOP,
    checkIsEnclaveUser: NOOP,
    addAllEnclaveSharesForNewCredential: NOOP,
    addAllSharesForNewCredential: NOOP,
    getSkipBasicLoginUpgradePromptPreference: NOOP,
  },
  params: {} as unknown as AuthLoginParams,
});

export const LoginProvider = ({
  children,
  authMethod: propsAuthMethod,
  isSwitchingWallets,
}: PropsWithChildren & {
  authMethod?: TAuthMethod;
  isSwitchingWallets?: boolean;
}) => {
  const para = usePara();

  const params = useExtractedParams<AuthLoginParams & AuthParams & AuthExtras & { isBasicLoginUpgradeVersion?: boolean }>();
  const authInfo: CoreAuthInfo = params.authInfo ?? {
    ...extractAuthInfo(params),
    pfpUrl: params.pfpUrl,
    displayName: params.displayName,
  };

  const authMethod = useMemo(() => {
    if (propsAuthMethod) {
      return propsAuthMethod;
    }

    return params.authMethod ?? 'BASIC_LOGIN';
  }, [propsAuthMethod, params.authMethod]);

  const [loginRes, setLoginRes] = useState<Awaited<ReturnType<typeof utils.authLogin>> | undefined>();
  const [wallets, setWallets] = useState<GroupedWallets>();
  const [balances, setBalances] = useState<ProfileBalance>();
  const [biometricLocationHints, setBiometricLocationHints] = useState<BiometricLocationHint[]>([]);
  const [sessionOrigin, setSessionOrigin] = useState<string>();

  const getSkipBasicLoginUpgradePromptPreference = useCallback(async () => {
    if (!params.isBasicLoginUpgradeVersion) {
      return true;
    }

    if (para.userId) {
      try {
        const {
          preferences: { shouldSkipBasicLoginUpgradePrompt },
        } = await para.ctx.client.getUserPreferences(para.userId);
        return shouldSkipBasicLoginUpgradePrompt;
      } catch (_) {
        return false;
      }
    }
    return false;
  }, [para, params.sessionId]);

  const checkIsEnclaveUser = useCallback(async () => {
    const auth = await para.ctx.client.sessionAuth(params.sessionId);
    const isSLOUser = auth.loginAuthMethods?.methods.includes(AuthMethod.BASIC_LOGIN);
    para.isEnclaveUser = isSLOUser;
    return isSLOUser;
  }, [para, params.sessionId]);

  const authLogin = useCallback(async (): ReturnType<typeof utils.authLogin> => {
    const loginRes = await utils.authLogin(para.ctx, { ...params, auth: authInfo.auth });

    setLoginRes(loginRes);

    return loginRes;
  }, [para, authInfo, params]);

  const authLoginWithPassword = useCallback(
    async (password: string, isPIN?: boolean): Promise<Awaited<ReturnType<typeof utils.authLoginWithPassword>>> => {
      const loginRes = await utils.authLoginWithPassword(
        para.ctx,
        {
          password,
          auth: authInfo.auth,
          ...params,
        },
        isPIN,
      );

      setLoginRes(loginRes);
      return loginRes;
    },
    [para, authInfo, params],
  );

  const fetchWallets = useCallback(async (): Promise<GroupedWallets> => {
    await para.touchSession();
    const _wallets = (await para.fetchWallets()).filter(({ pregenIdentifier }) => !pregenIdentifier);

    const _pregenWallets = para.ctx.apiKey
      ? (await para.ctx.client.getPregenWallets(para.pregenIds, true, para.getUserId())).wallets
      : [];

    const partnerCount = [...new Set([..._wallets, ..._pregenWallets].map(wallet => wallet.partnerId))].reduce(
      (obj, partnerId) => ({
        ...obj,
        [partnerId]: 0,
      }),
      {},
    );

    const allWallets: WalletEntity[] = [..._wallets, ..._pregenWallets]
      .sort((a, b) => ((b.createdAt || NO_DATE) > (a.createdAt || NO_DATE) ? -1 : 1))
      .map(wallet => {
        if (!!wallet.partnerId) {
          partnerCount[wallet.partnerId] += 1;
        }
        return {
          ...wallet,
          name:
            wallet.name ??
            `${!!wallet.partner?.displayName ? `${wallet.partner.displayName} ` : ''} Wallet${!wallet.partnerId || partnerCount[wallet.partnerId] <= 1 ? '' : ` ${partnerCount[wallet.partnerId]}`}`,
        };
      });

    const wallets = para.supportedWalletTypes.reduce(
      (obj, { type }) => ({
        ...obj,
        [type]: allWallets
          .filter(wallet => isWalletSupported([type], entityToWallet(wallet)))
          .sort((a, b) =>
            (b.lastUsedAt ?? b.createdAt ?? NO_DATE) < (a.lastUsedAt ?? a.createdAt ?? NO_DATE) || !b.isPregen ? -1 : 1,
          ),
      }),
      {},
    );

    await para.setWallets(
      allWallets.reduce(
        (obj, wallet) => ({
          ...obj,
          [wallet.id]: wallet,
        }),
        {},
      ),
    );

    setWallets(wallets);

    return wallets;
  }, [para, params]);

  const authUpdateKeyShares = useCallback(
    async (loginRes: LoginRes, opts: UpdateKeySharesOpts = {}) => {
      if (!loginRes) {
        return;
      }

      const { userId, userHandle, signature, passwordId } = loginRes;

      await utils.authUpdateKeyShares(para, {
        ...params,
        sessionId: opts.sessionId ?? params.sessionId,
        encryptionKey: opts.encryptionKey ?? params.encryptionKey ?? getPublicKeyHex(para.loginEncryptionKeyPair),
        userHandle,
        signature,
        passwordId,
        userId,
      });
    },
    [para, params, loginRes],
  );

  const authUpdateEnclaveKeyShares = useCallback(
    async ({ sessionId, encryptionKey }: UpdateKeySharesOpts = {}) => {
      const shares = await para.ctx.enclaveClient.retrieveSharesWithRetry([{ userId: para.userId }]);

      await utils.authUpdateKeyShares(para, {
        ...params,
        sessionId: sessionId ?? params.sessionId,
        encryptionKey: encryptionKey ?? params.encryptionKey ?? getPublicKeyHex(para.loginEncryptionKeyPair),
        enclaveShares: shares,
        userId: para.userId,
      });
    },
    [para, params],
  );

  const addAllSharesForNewCredential = useCallback(
    async ({ loginRes: loginResParam, sessionLookupId }: { loginRes?: LoginRes; sessionLookupId: string }) => {
      const _loginRes = loginResParam ?? loginRes;

      if (!_loginRes) {
        return;
      }

      const { userId, userHandle, signature, passwordId } = _loginRes;

      await utils.authUpdateAllKeyShares({
        para,
        userId,
        biometricData: {
          signatureId: signature?.id,
          passwordId,
          userHandle,
        },
        sessionLookupId,
      });
    },
    [para, params, loginRes],
  );

  const addAllEnclaveSharesForNewCredential = useCallback(
    async (sessionLookupId: string) => {
      const shares = await para.ctx.enclaveClient.retrieveSharesWithRetry([{ userId: para.userId }]);

      await utils.authUpdateAllKeyShares({
        para,
        userId: para.userId,
        enclaveData: {
          shares,
        },
        sessionLookupId,
      });
    },
    [para, params],
  );

  useEffect(() => {
    const loadSessionOrigin = async () => {
      if (params.sessionId) {
        const { origin } = await para.ctx.client.sessionOrigin(params.sessionId);
        setSessionOrigin(origin);
      }
    };

    loadSessionOrigin();
  }, [params.sessionId]);

  useEffect(() => {
    async function setUserDetails() {
      if (authInfo.auth) {
        await para.setAuth(authInfo.auth, {
          extras: {
            displayName: authInfo.displayName ?? params.displayName,
            pfpUrl: authInfo.pfpUrl ?? params.pfpUrl,
            externalWallet: authInfo.externalWallet ?? params.externalWallet,
          },
          userId: params.userId,
        });
      }

      if (params.pregenIds) {
        para.pregenIds = params.pregenIds;
      }

      if (!biometricLocationHints) {
        const hints = await para.ctx.client.getBiometricLocationHints(authInfo.auth);
        setBiometricLocationHints(hints);
      }
    }

    setUserDetails();
  }, [para, params, JSON.stringify(authInfo), biometricLocationHints]);

  useEffect(() => {
    async function loadBalances() {
      if (wallets) {
        const { balance } = await para.ctx.client.getProfileBalance({
          wallets:
            Object.values(wallets)
              .flat()
              .reduce(
                (acc, { type, address }) => {
                  if (acc.some(w => w.type === type && w.address === address)) {
                    return acc;
                  }
                  return [...acc, { type: type === 'COSMOS' ? 'EVM' : type, address }];
                },
                [] as { type: TWalletType; address: string }[],
              ) ?? [],
        });
        return balance;
      }
    }
    loadBalances().then(setBalances).catch(console.error);
  }, [wallets]);

  return (
    <LoginContext.Provider
      value={{
        fns: {
          authLogin,
          authLoginWithPassword,
          authUpdateKeyShares,
          fetchWallets,
          authUpdateEnclaveKeyShares,
          checkIsEnclaveUser,
          addAllEnclaveSharesForNewCredential,
          addAllSharesForNewCredential,
          getSkipBasicLoginUpgradePromptPreference,
        },
        authInfo,
        params,
        authMethod,
        isSwitchingWallets,
        wallets,
        biometricLocationHints,
        sessionOrigin,
        loginRes,
        balances,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);
