import { StepContainer } from '../common.js';
import { OnRampProvider, OnRampPurchase } from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { lazy, useEffect, useMemo, useState } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { RampEmbed, StripeEmbed } from '@usecapsule/react-common';
import styled from 'styled-components';
import { useGoBack } from '../../hooks/useGoBack.js';

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
  const capsule = useCapsuleStore(state => state.capsule);
  const appName = useThemeStore(state => state.appName);
  const isDark = useThemeStore(state => state.isDark);

  const [MoonPayEmbed, setMoonPayEmbed] = useState(null);

  const props = {
    capsule,
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

    setMoonPayEmbed(_MoonPayEmbed);
  }, []);

  const onRampEmbed = useMemo(() => {
    if (!onRampPurchase.id) {
      return null;
    }
    switch (onRampPurchase?.provider) {
      case OnRampProvider.STRIPE:
        return <StripeEmbed {...props} />;
      case OnRampProvider.MOONPAY:
        return !MoonPayEmbed || typeof window === 'undefined' ? null : <MoonPayEmbed {...props} />;
      case OnRampProvider.RAMP:
        return <RampEmbed apiKey={onRampConfig.rampApiKey} {...props} />;
    }
  }, [onRampPurchase?.provider, MoonPayEmbed]);

  useEffect(() => {
    let timeoutId;

    if (onRampPurchase?.status && ['CANCELLED', 'FINISHED'].includes(onRampPurchase.status)) {
      timeoutId = setTimeout(() => {
        setStep(STEPS[onRampPurchase.status]);
      }, 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [onRampPurchase?.status]);

  return <Container $wide>{onRampEmbed}</Container>;
};

const Container = styled(StepContainer)`
  flex: 1;
`;
