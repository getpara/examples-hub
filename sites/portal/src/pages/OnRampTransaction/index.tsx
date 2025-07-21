import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MoonPayEmbed, RampEmbed } from '@getpara/react-common';
import { usePara } from '../../components/ParaContext';
import { StripeEmbed } from '../../components/StripeEmbed';
import { authLogin, authLoginWithPassword, authUpdateKeyShares } from '../../utils/authLogin';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import {
  CurrentWalletIds,
  OnRampConfig,
  OnRampProvider,
  OnRampPurchase,
  OnRampPurchaseStatus,
  OnRampPurchaseUpdateParams,
} from '@getpara/user-management-client';
import { CpslSpinner } from '@getpara/react-components';
import styled from 'styled-components';
import { AuthMethod, getNetworkPrefix, getPublicKeyHex, offRampSend, OfframpDepositRequest } from '@getpara/web-sdk';
import { useExtractedParams } from '../../hooks/useExtractedParams';
import { EnterPasswordStep } from '../AuthLogin/components/EnterPasswordStep';

const MAX_AUTH_RETRIES = 5;

export function OnRampTransaction() {
  const para = usePara();
  const { userId, purchaseId, providerKey } = useExtractedParams<{
    userId: string;
    purchaseId: string;
    providerKey?: string;
  }>();
  const [searchParams] = useSearchParams();
  const { isDark } = useModalOutletContext();
  const [isAwaitingPassword, setIsAwaitingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const paramsCurrentWalletIds = (() => {
    try {
      const fromParam = searchParams.get('currentWalletIds');
      return fromParam ? (JSON.parse(fromParam) as CurrentWalletIds) : undefined;
    } catch (e) {
      return undefined;
    }
  })();

  const { toggleBranding } = useModalOutletContext();
  toggleBranding(true);

  const [onRampPurchase, setOnRampPurchase] = useState<OnRampPurchase | null>(null);
  const [onRampConfig, setOnRampConfig] = useState<OnRampConfig | null>(null);

  async function login(sessionId: string, partnerId: string) {
    await para.setLoginEncryptionKeyPair();
    const { userHandle, signature } = await authLogin(para.ctx, { partnerId, auth: { userId }, sessionId });

    await para.userSetupAfterLogin();
    await para.setCurrentWalletIds(paramsCurrentWalletIds);

    await authUpdateKeyShares(para, {
      sessionId,
      userId,
      encryptionKey: getPublicKeyHex(para.loginEncryptionKeyPair),
      userHandle,
      signature,
    });

    const temporaryShares = await para.getTransmissionKeyShares();
    await para.setupAfterLogin(temporaryShares.data.temporaryShares);
  }

  async function postLoginSetup() {
    await para.userSetupAfterLogin();
    await para.setCurrentWalletIds(paramsCurrentWalletIds);

    const _onRampPurchase = (
      await para.ctx.client.getOnRampPurchase({
        userId,
        purchaseId,
        walletId: searchParams.get('walletId') || undefined,
        externalWalletAddress: searchParams.get('externalWalletAddress') || undefined,
      })
    ).data;

    const _onRampConfig = await para.ctx.client.getOnRampConfig();

    setOnRampPurchase({ ..._onRampPurchase, providerKey });
    setOnRampConfig(_onRampConfig);
  }

  async function loginWithPassword(password: string) {
    const { partnerId } = await para.touchSession();

    try {
      setPasswordError(undefined);
      await para.touchSession();
      await authLoginWithPassword(para.ctx, { password, partnerId, auth: { userId } });

      setIsAwaitingPassword(false);
      await postLoginSetup();
    } catch (err) {
      setPasswordError('Password is incorrect');
    }
  }

  async function performSetup() {
    const { partnerId, sessionId } = await para.touchSession(true);

    if (
      !para.isFullyLoggedIn() ||
      Object.values(paramsCurrentWalletIds)
        .flat()
        .some(id => !para.wallets[id]?.signer)
    ) {
      const supportedAuthMethods = await para.supportedAuthMethods({ userId });

      const [isPasskey, isPassword] = [
        supportedAuthMethods.has(AuthMethod.PASSKEY),
        supportedAuthMethods.has(AuthMethod.PASSWORD),
      ];

      if (isPasskey) {
        let retriesLeft = MAX_AUTH_RETRIES;

        while (retriesLeft > 0) {
          try {
            if (
              !para.isFullyLoggedIn() ||
              Object.values(paramsCurrentWalletIds)
                .flat()
                .some(id => !para.wallets[id]?.signer)
            ) {
              await login(sessionId, partnerId);
            }

            break;
          } catch (e) {
            console.error(e);

            if (e.status === 401) {
              await login(sessionId, partnerId);
            }

            retriesLeft--;
          }

          if (retriesLeft === 0) {
            // setTransactionReviewState(TransactionReviewState.Error);
            return;
          }
        }

        await postLoginSetup();
        return;
      }

      if (isPassword) {
        setIsAwaitingPassword(true);
        return;
      }
    }
  }

  const onUpdate = async (updates: OnRampPurchaseUpdateParams) => {
    const updated = await para.ctx.client.updateOnRampPurchase({
      userId,
      walletId: onRampPurchase.walletId,
      externalWalletAddress: onRampPurchase.externalWalletAddress,
      purchaseId: onRampPurchase.id,
      updates,
    });

    setOnRampPurchase(updated);
  };

  const onSuccess = async (updates: OnRampPurchaseUpdateParams) => {
    await onUpdate({
      ...updates,
      status: OnRampPurchaseStatus.FINISHED,
    });

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.close();
      }
    }, 5000);
  };

  const onDepositRequest = async (depositRequest: OfframpDepositRequest) => {
    const { txHash, updatedOnRampPurchase } = await offRampSend(para, onRampPurchase, depositRequest);

    setOnRampPurchase(updatedOnRampPurchase);

    return txHash;
  };

  const onSignMoonPayUrl = async (url: string) => {
    if (userId || !onRampPurchase.walletType) {
      throw new Error('missing required fields');
    }

    const res = await para.ctx.client.signMoonPayUrl(para.getUserId()!, {
      url,
      type: onRampPurchase.walletType,
      cosmosPrefix: getNetworkPrefix(onRampPurchase.network),
      testMode: onRampPurchase.testMode,
      walletId: onRampPurchase.walletId || undefined,
      externalWalletAddress: onRampPurchase.externalWalletAddress || undefined,
    });

    return res.data.signature;
  };

  const onRampEmbed = useMemo(() => {
    if (isAwaitingPassword) {
      return <EnterPasswordStep error={passwordError} onLoginClick={loginWithPassword} />;
    }
    if (!onRampConfig || !onRampPurchase) {
      return <CpslSpinner />;
    }

    const props = {
      onRampConfig,
      onRampPurchase: onRampPurchase as OnRampPurchase,
      isDark,
      onUpdate,
      onSuccess,
      onDepositRequest,
    };

    switch (onRampPurchase?.provider) {
      case OnRampProvider.MOONPAY:
        return <MoonPayEmbed {...props} email={para.email} onUrlSignatureRequest={onSignMoonPayUrl} />;
      case OnRampProvider.STRIPE:
        return <StripeEmbed {...props} />;
      case OnRampProvider.RAMP:
        return <RampEmbed apiKey={onRampConfig.rampApiKey} email={para.email} {...props} />;
      default:
        return null;
    }
  }, [para.email, onRampConfig, onRampPurchase, isAwaitingPassword, isDark]);

  useEffect(() => {
    performSetup();
  }, [para]);

  return <Container>{onRampEmbed}</Container>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
