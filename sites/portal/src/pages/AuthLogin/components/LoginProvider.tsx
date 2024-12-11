import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as utils from '../../../utils/authLogin';
import { AuthLoginParams } from '../../../utils/authLogin';
import { useCapsule } from '../../../components/CapsuleContext';
import { CountryCallingCode } from 'libphonenumber-js';
import { entityToWallet, isWalletSupported, WalletEntity, WalletType } from '@usecapsule/core-sdk';
import { formatISO } from 'date-fns';
import { useCloseWindow } from '../../../hooks/useCloseWindow';
import { BiometricLocationHint } from '@usecapsule/user-management-client';
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
  const capsule = useCapsule();
  const closeWindow = useCloseWindow();

  const params = useExtractedParams<AuthLoginParams>();

  const [loginRes, setLoginRes] = useState<Awaited<ReturnType<typeof utils.authLogin>> | undefined>();
  const [wallets, setWallets] = useState<Wallets>();
  const [biometricLocationHints, setBiometricLocationHints] = useState<BiometricLocationHint[]>([]);
  const [sessionOrigin, setSessionOrigin] = useState<string>();

  const authLogin = useCallback(async (): ReturnType<typeof utils.authLogin> => {
    const loginRes = await utils.authLogin(capsule, params);

    setLoginRes(loginRes);

    return loginRes;
  }, [capsule, params]);

  const authLoginWithPassword = useCallback(
    async (password: string): Promise<Awaited<ReturnType<typeof utils.authLoginWithPassword>>> => {
      const loginRes = await utils.authLoginWithPassword(capsule, {
        password,
        userId: params.userId,
        ...params,
      });

      setLoginRes(loginRes);
      return loginRes;
    },
    [capsule, params],
  );

  const fetchWallets = useCallback(async (): Promise<Wallets> => {
    await capsule.touchSession();
    const _wallets = (await capsule.fetchWallets()).filter(({ pregenIdentifier }) => !pregenIdentifier);

    const _pregenWallets = capsule.ctx.apiKey ? await capsule.getPregenWallets() : [];

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

    const wallets = capsule.supportedWalletTypes.reduce(
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

    await capsule.setWallets(
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
  }, [capsule, params]);

  const authUpdateKeyShares = useCallback(
    async (loginResParam?: LoginRes) => {
      const _loginRes = loginResParam ?? loginRes;

      if (!_loginRes) {
        return;
      }

      const { userId, userHandle, signature, passwordId } = _loginRes;

      await utils.authUpdateKeyShares(capsule, {
        ...params,
        encryptionKey: params.encryptionKey,
        userHandle,
        signature,
        passwordId,
        userId,
      });
    },
    [capsule, params, loginRes],
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
        const { origin } = await capsule.ctx.capsuleClient.sessionOrigin(params.sessionId);
        setSessionOrigin(origin);
      }
    };

    loadSessionOrigin();
  }, [params.sessionId]);

  useEffect(() => {
    async function setUserDetails() {
      if (!capsule.getEmail() && params.email) {
        await capsule.setEmail(params.email);
      }

      if (params.phone && params.countryCode) {
        await capsule.setPhoneNumber(params.phone, params.countryCode as CountryCallingCode);
      }

      if (params.farcasterUsername) {
        await capsule.setFarcasterUsername(params.farcasterUsername);
      }

      if (params.pregenIds) {
        capsule.pregenIds = params.pregenIds;
      }

      const hints = await capsule.getUserBiometricLocationHints();
      setBiometricLocationHints(hints);
    }

    setUserDetails();
  }, [capsule, params]);

  return (
    <LoginContext.Provider
      value={{
        fns: { authLogin, authLoginWithPassword, authUpdateKeyShares, fetchWallets, finishLogin },
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
