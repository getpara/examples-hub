import { StepContainer } from '../common.js';
import { OnRampProvider, OnRampPurchase } from '@getpara/web-sdk';
import { useModalStore } from '../../stores/index.js';
import { lazy, useEffect, useMemo, useState } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { MoonPayEmbed as CommonMoonPayEmbed, RampEmbed, StripeEmbed } from '@getpara/react-common';
import styled from 'styled-components';
import { useGoBack } from '../../hooks/useGoBack.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';

const STEPS = {
  CANCELLED: ModalStep.ADD_FUNDS_FAILURE,
  FINISHED: ModalStep.ADD_FUNDS_SUCCESS,
};

export const AddFundsAwaiting = () => {
  const setStep = useModalStore(state => state.setStep);
  const goBack = useGoBack();
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);
  const para = useInternalClient();
  const appName = useStore(state => state.appName);
  const isDark = useStore(state => state.isDarkTheme);

  const [MoonPayEmbed, setMoonPayEmbed] = useState<typeof CommonMoonPayEmbed>();

  const props = {
    para,
    appName,
    onRampConfig,
    onRampPurchase: onRampPurchase as OnRampPurchase,
    isDark,
    isEmbedded: true,
    setOnRampPurchase,
    onClose: goBack,
  };

  useEffect(() => {
    const _MoonPayEmbed = lazy(() => import(`./MoonPayEmbed.js`));

    if (_MoonPayEmbed) {
      setMoonPayEmbed(_MoonPayEmbed as any);
    }
  }, []);

  const onRampEmbed = useMemo(() => {
    if (!onRampPurchase?.id || !props.onRampConfig) {
      return null;
    }
    switch (onRampPurchase?.provider) {
      case OnRampProvider.STRIPE:
        return <StripeEmbed {...props} onRampConfig={props.onRampConfig} />;
      case OnRampProvider.MOONPAY:
        return !MoonPayEmbed || typeof window === 'undefined' ? null : (
          <MoonPayEmbed {...props} onRampConfig={props.onRampConfig} />
        );
      case OnRampProvider.RAMP:
        return <RampEmbed {...props} apiKey={props.onRampConfig?.rampApiKey ?? ''} onRampConfig={props.onRampConfig} />;
    }
  }, [onRampPurchase?.provider, MoonPayEmbed]);

  useEffect(() => {
    let timeoutId;

    if (onRampPurchase?.status && ['CANCELLED', 'FINISHED'].includes(onRampPurchase.status)) {
      timeoutId = setTimeout(() => {
        setStep(STEPS[onRampPurchase.status ?? '']);
      }, 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [onRampPurchase?.status]);

  return <Container $wide>{onRampEmbed}</Container>;
};

const Container = styled(StepContainer)`
  flex: 1;
`;
