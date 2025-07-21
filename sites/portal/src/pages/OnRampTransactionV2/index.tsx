import { useState, useEffect, useMemo, useRef } from 'react';
import { MoonPayEmbed, RampEmbed } from '@getpara/react-common';
import { StripeEmbed } from '../../components/StripeEmbed';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import {
  OnRampConfig,
  OnRampProvider,
  OnRampPurchase,
  OnRampPurchaseStatus,
  OnRampPurchaseUpdateParams,
} from '@getpara/user-management-client';
import { CpslSpinner } from '@getpara/react-components';
import styled from 'styled-components';
import { OfframpDepositRequest } from '@getpara/web-sdk';
import { useExtractedParams } from '../../hooks/useExtractedParams';
import { PortalEmitter } from '../../classes/index.js';

export function OnRampTransactionV2() {
  const { origin, email } = useExtractedParams<{ origin: string; email: string }>();
  const { isDark } = useModalOutletContext();

  const portalEmitter = useMemo(() => {
    return origin ? new PortalEmitter(origin) : null;
  }, [origin]);

  const { toggleBranding } = useModalOutletContext();
  toggleBranding(true);

  const isInitialized = useRef(false);
  const [onRampPurchase, setOnRampPurchase] = useState<OnRampPurchase | null>(null);
  const [onRampConfig, setOnRampConfig] = useState<OnRampConfig | null>(null);

  const onUpdate = async (updates: OnRampPurchaseUpdateParams) => {
    const { onRampPurchase } = await portalEmitter?.updateOnRampPurchase({ updates });

    setOnRampPurchase(onRampPurchase);
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
    const { txHash, onRampPurchase: updatedOnRampPurchase } = await portalEmitter?.signWithdrawTx({
      depositRequest,
    });

    setOnRampPurchase(updatedOnRampPurchase);

    return txHash;
  };

  const onSignMoonPayUrl = async (url: string) => {
    const { signature } = await portalEmitter?.signMoonPayUrl({
      url,
    });

    return signature;
  };

  const onRampEmbed = useMemo(() => {
    if (!onRampConfig || !onRampPurchase) {
      return <CpslSpinner />;
    }

    const props = {
      onRampConfig,
      onRampPurchase,
      isDark,
      onSuccess,
      onUpdate,
      onDepositRequest,
    };

    switch (onRampPurchase?.provider) {
      case OnRampProvider.MOONPAY:
        return <MoonPayEmbed {...props} email={email} onUrlSignatureRequest={onSignMoonPayUrl} />;
      case OnRampProvider.STRIPE:
        return <StripeEmbed {...props} />;
      case OnRampProvider.RAMP:
        return <RampEmbed apiKey={onRampConfig.rampApiKey} email={email} {...props} />;
      default:
        return null;
    }
  }, [email, onRampConfig, onRampPurchase, onSignMoonPayUrl, isDark, portalEmitter]);

  useEffect(() => {
    if (portalEmitter && !isInitialized.current) {
      portalEmitter
        ?.init()
        .then(({ onRampConfig, onRampPurchase }) => {
          setOnRampConfig(onRampConfig);
          setOnRampPurchase(onRampPurchase);

          isInitialized.current = true;
        })
        .catch(console.error);
    }
  }, [portalEmitter]);

  return <Container>{onRampEmbed}</Container>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
