import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as utils from '../../../utils/authLogin';
import { AuthLoginParams } from '../../../utils/authLogin';
import { usePara } from '../../../components/ParaContext';
import { entityToWallet, isWalletSupported, WalletEntity, WalletType } from '@getpara/core-sdk';
import { formatISO } from 'date-fns';
import { useCloseWindow } from '../../../hooks/useCloseWindow';
import { AuthInfo, BiometricLocationHint, extractAuthInfo } from '@getpara/user-management-client';
import { useExtractedParams } from '../../../hooks/useExtractedParams';

const NOOP = () => {
  throw new Error();
};

export type Wallets = Partial<Record<WalletType, WalletEntity[]>>;

export type LoginRes = Awaited<ReturnType<typeof utils.authLogin>>;

type Login = {
  fns: {
    authLogin: () => Promise<Awaited<ReturnType<typeof utils.authLogin>>>;
    authLoginWithPassword: (password: string) => Promise<Awaited<ReturnType<typeof utils.authLoginWithPassword>>>;
    authUpdateKeyShares: (_?: LoginRes) => Promise<void>;
    fetchWallets: () => Promise<Wallets>;
    finishLogin: (_?: boolean) => Promise<void>;
  };
  authInfo?: AuthInfo | undefined;
  params: AuthLoginParams;
  wallets?: Wallets;
  biometricLocationHints?: BiometricLocationHint[];
  sessionOrigin?: string;
};

const NO_DATE = formatISO(new Date(-8640000000000000));

export const LoginContext = createContext<Login>({
  fns: { authLogin: NOOP, authLoginWithPassword: NOOP, authUpdateKeyShares: NOOP, fetchWallets: NOOP, finishLogin: NOOP },
  params: {} as unknown as utils.AuthLoginParams,
});

export const LoginProvider = ({ children }: PropsWithChildren) => {
  const para = usePara();
  const closeWindow = useCloseWindow();

  const params = useExtractedParams<AuthLoginParams>();
  const authInfo = extractAuthInfo(params);

  const [loginRes, setLoginRes] = useState<Awaited<ReturnType<typeof utils.authLogin>> | undefined>();
  const [wallets, setWallets] = useState<Wallets>();
  const [biometricLocationHints, setBiometricLocationHints] = useState<BiometricLocationHint[]>([]);
  const [sessionOrigin, setSessionOrigin] = useState<string>();

  const authLogin = useCallback(async (): ReturnType<typeof utils.authLogin> => {
    const loginRes = await utils.authLogin(para, params);

    setLoginRes(loginRes);

    return loginRes;
  }, [para, params]);

  const authLoginWithPassword = useCallback(
    async (password: string): Promise<Awaited<ReturnType<typeof utils.authLoginWithPassword>>> => {
      const loginRes = await utils.authLoginWithPassword(para, {
        password,
        userId: params.userId,
        ...params,
      });

      setLoginRes(loginRes);
      return loginRes;
    },
    [para, params],
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

  const finishLogin = useCallback(
    async (shouldClose = false) => {
      await authUpdateKeyShares();

      if (shouldClose) {
        closeWindow(true);
      }
    },
    [closeWindow, authUpdateKeyShares],
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
      switch (authInfo?.authType) {
        case 'email':
          await para.setEmail(authInfo.identifier);
          break;
        case 'phone':
          await para.setPhoneNumber(authInfo.identifier);
          break;
        case 'farcaster':
          await para.setFarcasterUsername(authInfo.identifier);
          break;
        case 'telegram':
          await para.setTelegramUserId(authInfo.identifier);
          break;
        case 'externalWallet':
          await para.setExternalWallet({
            address: params.externalWalletAddress,
            // Type isn't important here, we only care about the address
            type: WalletType.EVM,
          });
          break;
      }

      if (params.pregenIds) {
        para.pregenIds = params.pregenIds;
      }

      if (!biometricLocationHints) {
        const hints = await para.getUserBiometricLocationHints();
        setBiometricLocationHints(hints);
      }
    }

    setUserDetails();
  }, [para, params, JSON.stringify(authInfo), biometricLocationHints]);

  return (
    <LoginContext.Provider
      value={{
        fns: { authLogin, authLoginWithPassword, authUpdateKeyShares, fetchWallets, finishLogin },
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
