import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as utils from '../../../utils/authLogin';
import { useSearchParams } from 'react-router-dom';
import { useCapsule } from '../../../components/CapsuleContext';
import { CountryCallingCode } from 'libphonenumber-js';
import { PregenIdentifierType } from '@usecapsule/core-sdk';
import { WalletEntity } from '@usecapsule/user-management-client';
import { formatISO } from 'date-fns';
import { useCloseWindow } from '../../../hooks/useCloseWindow';

const NOOP = () => {
  throw new Error();
};

type LoginParams = {
  email?: string;
  phone?: string;
  countryCode?: CountryCallingCode;
  farcasterUsername?: string;
  encryptionKey?: string;
  sessionId?: string;
  partnerId?: string;
  newDeviceSessionLookupId?: string;
  newDeviceEncryptionKey?: string;
  skipAutoLogin?: boolean;
  pregenWalletIds?: Record<string, true>;
};

type Login = {
  fns: {
    authLogin: () => Promise<void>;
    authUpdateKeyShares: () => Promise<void>;
    fetchWallets: () => Promise<{ wallets: WalletEntity[]; pregenWallets: WalletEntity[] }>;
    finishLogin: (_?: boolean) => Promise<void>;
  };
  params: LoginParams;
  wallets?: WalletEntity[];
  pregenWallets?: WalletEntity[];
};

const NO_DATE = formatISO(new Date(-8640000000000000));

export const LoginContext = createContext<Login>({
  fns: { authLogin: NOOP, authUpdateKeyShares: NOOP, fetchWallets: NOOP, finishLogin: NOOP },
  params: {},
});

export const LoginProvider = ({ children }: PropsWithChildren) => {
  const capsule = useCapsule();
  const [searchParams] = useSearchParams();
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

    return {
      email: paramsEmail,
      phone: paramsPhone,
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
    };
  }, [searchParams]);

  const [loginRes, setLoginRes] = useState<[string, string, any] | undefined>();
  const [wallets, setWallets] = useState<WalletEntity[]>();
  const [pregenWallets, setPregenWallets] = useState<WalletEntity[]>();

  const authLogin = useCallback(async (): Promise<void> => {
    const loginRes = await utils.authLogin(
      capsule,
      params.partnerId,
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

  const fetchWallets = useCallback(async (): Promise<{ wallets: WalletEntity[]; pregenWallets: WalletEntity[] }> => {
    const _wallets = (await capsule.fetchWallets()).filter(({ pregenIdentifier }) => !pregenIdentifier);

    const email = capsule.getEmail();

    const [pregenIdentifier, pregenIdentifierType] = email
      ? [email, PregenIdentifierType.EMAIL]
      : [capsule.getPhoneNumber(), PregenIdentifierType.PHONE];

    const _pregenWallets = capsule.ctx.apiKey
      ? (await capsule.getPregenWallets(pregenIdentifier, pregenIdentifierType, true)).filter(
          wallet => params.pregenWalletIds[wallet.id],
        )
      : [];

    const wallets = _wallets
      .sort((a, b) => ((b.createdAt || NO_DATE) > (a.createdAt || NO_DATE) ? -1 : 1))
      .map((wallet, i) => ({ ...wallet, name: wallet.name || `Wallet${i === 0 ? '' : ` ${i + 1}`}` }))
      .sort((a, b) => ((b.lastUsedAt || NO_DATE) < (a.lastUsedAt || NO_DATE) ? -1 : 1));

    const pregenWallets = _pregenWallets.map(wallet => ({
      ...wallet,
      name: wallet.name || `${wallet.partner.displayName} Wallet`,
    }));

    await capsule.setWallets(
      [..._wallets, ..._pregenWallets].reduce(
        (obj, wallet) => ({
          ...obj,
          [wallet.id]: wallet,
        }),
        {},
      ),
    );

    setWallets(wallets);
    setPregenWallets(pregenWallets);

    return { wallets, pregenWallets };
  }, [capsule, params.pregenWalletIds, params.phone, params.countryCode]);

  const authUpdateKeyShares = useCallback(async () => {
    if (!loginRes) {
      return;
    }

    const [userId, userHandle, signature] = loginRes;

    await utils.authUpdateKeyShares(
      capsule,
      params.sessionId,
      userId,
      params.encryptionKey,
      userHandle,
      signature,
      params.newDeviceSessionLookupId,
      params.newDeviceEncryptionKey,
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
    }

    setUserDetails();
  }, [capsule, params.email, params.phone, params.countryCode, params.farcasterUsername]);

  return (
    <LoginContext.Provider
      value={{ fns: { authLogin, authUpdateKeyShares, fetchWallets, finishLogin }, params, wallets, pregenWallets }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);

// export const useLoginParams = () => useContext(LoginParamsContext);
