import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as utils from '../../../utils/authLogin';
import { AuthLoginParams } from '../../../utils/authLogin';
import { usePara } from '../../../components/ParaContext';
import { CoreAuthInfo, entityToWallet, isWalletSupported, WalletEntity, TWalletType, ShareData } from '@getpara/core-sdk';
import { formatISO } from 'date-fns';
import { useCloseWindow } from '../../../hooks/useCloseWindow';
import {
  AuthExtras,
  AuthInfo,
  AuthMethod,
  AuthParams,
  BiometricLocationHint,
  extractAuthInfo,
} from '@getpara/user-management-client';
import { useExtractedParams } from '../../../hooks/useExtractedParams';

const NOOP = () => {
  throw new Error();
};

export type Wallets = Partial<Record<TWalletType, WalletEntity[]>>;

export type LoginRes = Awaited<ReturnType<typeof utils.authLogin>>;

type Login = {
  fns: {
    authLogin: () => Promise<Awaited<ReturnType<typeof utils.authLogin>>>;
    authLoginWithPassword: (
      password: string,
      isPIN?: boolean,
    ) => Promise<Awaited<ReturnType<typeof utils.authLoginWithPassword>>>;
    authUpdateKeyShares: (_?: LoginRes) => Promise<void>;
    fetchWallets: () => Promise<Wallets>;
    finishLogin: (_?: boolean) => Promise<void>;
    authUpdateEnclaveKeyShares: (_?: ShareData[]) => Promise<void>;
    checkIsEnclaveUser: () => Promise<boolean>;
  };
  authInfo?: AuthInfo | undefined;
  params: AuthLoginParams;
  wallets?: Wallets;
  biometricLocationHints?: BiometricLocationHint[];
  sessionOrigin?: string;
};

export const NO_DATE = formatISO(new Date(-8640000000000000));

export const LoginContext = createContext<Login>({
  fns: {
    authLogin: NOOP,
    authLoginWithPassword: NOOP,
    authUpdateKeyShares: NOOP,
    fetchWallets: NOOP,
    finishLogin: NOOP,
    authUpdateEnclaveKeyShares: NOOP,
    checkIsEnclaveUser: NOOP,
  },
  params: {} as unknown as utils.AuthLoginParams,
});

export const LoginProvider = ({ children }: PropsWithChildren) => {
  const para = usePara();
  const closeWindow = useCloseWindow();

  const params = useExtractedParams<AuthLoginParams & AuthParams & AuthExtras>();
  const authInfo: CoreAuthInfo = params.authInfo ?? {
    ...extractAuthInfo(params),
    pfpUrl: params.pfpUrl,
    displayName: params.displayName,
  };

  const [loginRes, setLoginRes] = useState<Awaited<ReturnType<typeof utils.authLogin>> | undefined>();
  const [wallets, setWallets] = useState<Wallets>();
  const [biometricLocationHints, setBiometricLocationHints] = useState<BiometricLocationHint[]>([]);
  const [sessionOrigin, setSessionOrigin] = useState<string>();

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

  const fetchWallets = useCallback(async (): Promise<Wallets> => {
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
    async (loginResParam?: LoginRes) => {
      const _loginRes = loginResParam ?? loginRes;

      if (!_loginRes) {
        return;
      }

      const { userId, userHandle, signature, passwordId } = _loginRes;

      await utils.authUpdateKeyShares(para, {
        ...params,
        encryptionKey: params.encryptionKey,
        userHandle,
        signature,
        passwordId,
        userId,
      });
    },
    [para, params, loginRes],
  );

  const authUpdateEnclaveKeyShares = useCallback(async () => {
    const shares = await para.ctx.enclaveClient.retrieveSharesWithRetry([{ userId: para.userId }]);

    await utils.authUpdateKeyShares(para, {
      ...params,
      encryptionKey: params.encryptionKey,
      enclaveShares: shares,
      userId: para.userId,
    });
  }, [para, params]);

  const finishLogin = useCallback(
    async (shouldClose = false) => {
      const isEnclaveUser = await checkIsEnclaveUser();

      await (isEnclaveUser ? authUpdateEnclaveKeyShares() : authUpdateKeyShares());

      if (shouldClose) {
        closeWindow(true);
      }
    },
    [closeWindow, authUpdateKeyShares, params.sessionId],
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
      await para.setAuth(authInfo.auth, {
        extras: {
          displayName: authInfo.displayName ?? params.displayName,
          pfpUrl: authInfo.pfpUrl ?? params.pfpUrl,
          externalWallet: authInfo.externalWallet ?? params.externalWallet,
        },
        userId: params.userId,
      });

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

  return (
    <LoginContext.Provider
      value={{
        fns: {
          authLogin,
          authLoginWithPassword,
          authUpdateKeyShares,
          fetchWallets,
          finishLogin,
          authUpdateEnclaveKeyShares,
          checkIsEnclaveUser,
        },
        authInfo,
        params,
        wallets,
        biometricLocationHints,
        sessionOrigin,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);
