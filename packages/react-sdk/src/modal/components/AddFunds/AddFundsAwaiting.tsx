import { StepContainer } from '../common.js';
import { OnRampProvider } from '@usecapsule/web-sdk';
import { useModalStore } from '../../stores/index.js';
import { lazy, useEffect, useMemo, useState } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { StripeEmbed } from '../OnRampComponents/StripeComponents.js';
import { RampEmbed } from '../OnRampComponents/RampComponents.js';
import styled from 'styled-components';

const STEPS = {
  CANCELLED: ModalStep.ADD_FUNDS_FAILURE,
  FINISHED: ModalStep.ADD_FUNDS_SUCCESS,
};

export const AddFundsAwaiting = () => {
  const setStep = useModalStore(state => state.setStep);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);

  const [MoonPayEmbed, setMoonPayEmbed] = useState(null);

  useEffect(() => {
    const _MoonPayEmbed = lazy(() => import(`../OnRampComponents/MoonPayComponents.js`));

    setMoonPayEmbed(_MoonPayEmbed);
  }, []);

  const onRampEmbed = useMemo(() => {
    switch (onRampPurchase?.provider) {
      case OnRampProvider.STRIPE:
        return <StripeEmbed />;
      case OnRampProvider.MOONPAY:
        return !MoonPayEmbed || typeof window === 'undefined' ? null : <MoonPayEmbed />;
      case OnRampProvider.RAMP:
        return <RampEmbed hostApiKey={onRampConfig.rampApiKey} />;
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
