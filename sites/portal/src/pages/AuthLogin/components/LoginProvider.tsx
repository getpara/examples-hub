import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as utils from '../../../utils/authLogin';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCapsule } from '../../../components/CapsuleContext';
import { CountryCallingCode } from 'libphonenumber-js';
import { entityToWallet, isWalletSupported, PregenIdentifierType, WalletEntity, WalletType } from '@usecapsule/core-sdk';
import { formatISO } from 'date-fns';
import { useCloseWindow } from '../../../hooks/useCloseWindow';
import { BiometricLocationHint } from '@usecapsule/user-management-client';

const NOOP = () => {
  throw new Error();
};

type LoginParams = {
  email?: string;
  phone?: string;
  userId?: string;
  countryCode?: CountryCallingCode;
  farcasterUsername?: string;
  encryptionKey?: string;
  sessionId?: string;
  partnerId?: string;
  newDeviceSessionLookupId?: string;
  newDeviceEncryptionKey?: string;
  skipAutoLogin?: boolean;
  isForKnownDeviceLogin?: boolean;
  pregenWalletIds?: Record<string, true>;
};

export type Wallets = Partial<Record<WalletType, WalletEntity[]>>;

type Login = {
  fns: {
    authLogin: () => Promise<void>;
    authUpdateKeyShares: () => Promise<void>;
    fetchWallets: () => Promise<Wallets>;
    finishLogin: (_?: boolean) => Promise<void>;
  };
  params: LoginParams;
  wallets?: Wallets;
  biometricLocationHints?: BiometricLocationHint[];
};

const NO_DATE = formatISO(new Date(-8640000000000000));

export const LoginContext = createContext<Login>({
  fns: { authLogin: NOOP, authUpdateKeyShares: NOOP, fetchWallets: NOOP, finishLogin: NOOP },
  params: {},
});

export const LoginProvider = ({ children }: PropsWithChildren) => {
  const capsule = useCapsule();
  const [searchParams] = useSearchParams();
  const { userId } = useParams();
  const closeWindow = useCloseWindow();

  const params: LoginParams = useMemo(() => {
    const paramsEmail = searchParams.get('email') ? decodeURIComponent(searchParams.get('email')) : undefined;
    const paramsPhone = searchParams.get('phone') ? decodeURIComponent(searchParams.get('phone')) : undefined;
    const paramsCountryCode = searchParams.get('countryCode')
      ? (decodeURIComponent(searchParams.get('countryCode')) as CountryCallingCode)
      : undefined;
    const paramsFarcasterUsername = searchParams.get('farcasterUsername')
      ? decodeURIComponent(searchParams.get('farcasterUsername'))
      : undefined;
    const paramsEncryptionKey = searchParams.get('encryptionKey');
    const paramsSessionId = searchParams.get('sessionId');
    const paramsNewDeviceSessionLookupId = searchParams.get('newDeviceSessionId') || undefined;
    const paramsNewDeviceEncryptionKey = searchParams.get('newDeviceEncryptionKey') || undefined;
    const paramsPartnerId = searchParams.get('partnerId');
    const paramsPregenWalletIds = searchParams.get('pregenWalletIds');
    const paramsIsForKnownDeviceLogin = searchParams.get('isForKnownDeviceLogin');

    return {
      email: paramsEmail,
      phone: paramsPhone,
      userId: userId ?? undefined,
      countryCode: paramsCountryCode,
      farcasterUsername: paramsFarcasterUsername,
      encryptionKey: paramsEncryptionKey,
      sessionId: paramsSessionId,
      partnerId: paramsPartnerId,
      newDeviceSessionLookupId: paramsNewDeviceSessionLookupId,
      newDeviceEncryptionKey: paramsNewDeviceEncryptionKey,
      pregenWalletIds: paramsPregenWalletIds
        ? paramsPregenWalletIds.split(',').reduce((obj, id) => ({ ...obj, [id]: true }), {})
        : {},
      isForKnownDeviceLogin: paramsIsForKnownDeviceLogin === 'true',
    };
  }, [searchParams]);

  const [loginRes, setLoginRes] = useState<Awaited<ReturnType<typeof utils.authLogin>> | undefined>();
  const [wallets, setWallets] = useState<Wallets>();
  const [biometricLocationHints, setBiometricLocationHints] = useState<BiometricLocationHint[]>([]);

  const authLogin = useCallback(async (): Promise<void> => {
    const loginRes = await utils.authLogin(
      capsule,
      params.partnerId,
      undefined,
      params.email,
      params.phone,
      params.countryCode,
      params.farcasterUsername,
      params.sessionId,
      params.newDeviceSessionLookupId,
    );

    setLoginRes(loginRes);
  }, [
    capsule,
    params.partnerId,
    params.email,
    params.phone,
    params.countryCode,
    params.farcasterUsername,
    params.sessionId,
    params.encryptionKey,
    params.newDeviceSessionLookupId,
    params.newDeviceEncryptionKey,
  ]);

  const fetchWallets = useCallback(async (): Promise<Wallets> => {
    await capsule.touchSession();
    const _wallets = (await capsule.fetchWallets()).filter(({ pregenIdentifier }) => !pregenIdentifier);

    const email = capsule.getEmail();

    const [pregenIdentifier, pregenIdentifierType] = email
      ? [email, PregenIdentifierType.EMAIL]
      : [capsule.getPhoneNumber(), PregenIdentifierType.PHONE];

    const _pregenWallets = capsule.ctx.apiKey
      ? (await capsule.getPregenWallets(pregenIdentifier, pregenIdentifierType)).filter(
          wallet => params.pregenWalletIds[wallet.id],
        )
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
  }, [capsule, params.pregenWalletIds, params.phone, params.countryCode]);

  const authUpdateKeyShares = useCallback(async () => {
    if (!loginRes) {
      return;
    }

    const { userId, userHandle, signature } = loginRes;

    await utils.authUpdateKeyShares(
      capsule,
      params.sessionId,
      userId,
      params.encryptionKey,
      userHandle,
      signature,
      params.newDeviceSessionLookupId,
      params.newDeviceEncryptionKey,
      params.partnerId,
    );
  }, [
    capsule,
    params.sessionId,
    params.encryptionKey,
    params.newDeviceSessionLookupId,
    params.newDeviceEncryptionKey,
    loginRes,
  ]);

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
    async function setUserDetails() {
      if (!capsule.getEmail() && params.email) {
        await capsule.setEmail(params.email);
      }

      if (params.phone && params.countryCode) {
        await capsule.setPhoneNumber(params.phone, params.countryCode);
      }

      if (params.farcasterUsername) {
        await capsule.setFarcasterUsername(params.farcasterUsername);
      }

      const hints = await capsule.getUserBiometricLocationHints();
      setBiometricLocationHints(hints);
    }

    setUserDetails();
  }, [capsule, params.email, params.phone, params.countryCode, params.farcasterUsername]);

  return (
    <LoginContext.Provider
      value={{
        fns: { authLogin, authUpdateKeyShares, fetchWallets, finishLogin },
        params,
        wallets,
        biometricLocationHints,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);

// export const useLoginParams = () => useContext(LoginParamsContext);
