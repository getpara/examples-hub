import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MoonPayEmbed, StripeEmbed } from '@usecapsule/react-common';
import { useCapsule } from '../../components/CapsuleContext';
import { authLogin, authUpdateKeyShares } from '../../utils/authLogin';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { CurrentWalletIds, OnRampConfig, OnRampProvider, OnRampPurchase } from '@usecapsule/user-management-client';
import { CpslSpinner } from '@usecapsule/react-components';
import styled from 'styled-components';
import { getPublicKeyHex } from '@usecapsule/web-sdk';
import { useExtractedParams } from '../../hooks/useExtractedParams';

const MAX_AUTH_RETRIES = 5;

export function OnRampTransaction() {
  const capsule = useCapsule();
  const { userId, purchaseId, providerKey } = useExtractedParams<{
    userId: string;
    purchaseId: string;
    providerKey?: string;
  }>();
  const [searchParams] = useSearchParams();
  const { isDark } = useModalOutletContext();

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
    await capsule.setLoginEncryptionKeyPair();
    const { userHandle, signature } = await authLogin(capsule, { partnerId, userId, sessionId });

    await capsule.userSetupAfterLogin();
    await capsule.setCurrentWalletIds(paramsCurrentWalletIds);

    await authUpdateKeyShares(capsule, {
      sessionId,
      userId,
      encryptionKey: getPublicKeyHex(capsule.loginEncryptionKeyPair),
      userHandle,
      signature,
    });

    const temporaryShares = await capsule.getTransmissionKeyShares();
    await capsule.setupAfterLogin(temporaryShares.data.temporaryShares);
  }

  async function performSetup() {
    const res = await capsule.ctx.capsuleClient.touchSession(true);
    const partnerId = res.data.partnerId;

    let _onRampPurchase: OnRampPurchase, _onRampConfig: OnRampConfig;

    let retriesLeft = MAX_AUTH_RETRIES;

    while (retriesLeft > 0) {
      try {
        if (
          !capsule.isFullyLoggedIn() ||
          Object.values(paramsCurrentWalletIds)
            .flat()
            .some(id => !capsule.wallets[id]?.signer)
        ) {
          await login(res.data.sessionId, partnerId);
        }

        _onRampPurchase = (
          await capsule.ctx.capsuleClient.getOnRampPurchase({
            userId,
            purchaseId,
            walletId: searchParams.get('walletId') || undefined,
            externalWalletAddress: searchParams.get('externalWalletAddress') || undefined,
          })
        ).data;

        _onRampConfig = await capsule.ctx.capsuleClient.getOnRampConfig();
        break;
      } catch (e) {
        console.error(e);

        if (e.response?.status === 401) {
          await login(res.data.sessionId, partnerId);
        }

        retriesLeft--;
      }

      if (retriesLeft === 0) {
        // setTransactionReviewState(TransactionReviewState.Error);
        return;
      }
    }

    setOnRampPurchase({ ..._onRampPurchase, providerKey });
    setOnRampConfig(_onRampConfig);
  }

  const onRampEmbed = useMemo(() => {
    if (!onRampConfig || !onRampPurchase) {
      return <CpslSpinner />;
    }

    const props = {
      capsule,
      onRampConfig,
      onRampPurchase: onRampPurchase as OnRampPurchase,
      isDark,
      setOnRampPurchase,
    };

    switch (onRampPurchase?.provider) {
      case OnRampProvider.MOONPAY:
        return <MoonPayEmbed {...props} />;
      case OnRampProvider.STRIPE:
        return <StripeEmbed {...props} />;
      default:
        return null;
    }
  }, [onRampPurchase?.provider]);

  useEffect(() => {
    performSetup();
  }, [capsule]);

  return <Container>{onRampEmbed}</Container>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
