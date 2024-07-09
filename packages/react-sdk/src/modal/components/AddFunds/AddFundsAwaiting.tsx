import { MainContainer } from '../common.js';
import { OnRampProvider, RampConfig, getProvider } from '@usecapsule/web-sdk';
import { useModalStore } from '../../stores/index.js';
import { useEffect, useMemo } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { StripeEmbed } from '../OnRampComponents/StripeComponents.js';
import { RampEmbed } from '../OnRampComponents/RampComponents.js';

const STEPS = {
  CANCELLED: ModalStep.ADD_FUNDS_FAILURE,
  FINISHED: ModalStep.ADD_FUNDS_SUCCESS,
};

export const AddFundsAwaiting = () => {
  const setStep = useModalStore((state) => state.setStep);
  const onRampConfig = useModalStore((state) => state.onRampConfig);
  const onRampPurchase = useModalStore((state) => state.onRampPurchase);

  const onRampEmbed = useMemo(() => {
    switch (onRampPurchase?.provider) {
      case OnRampProvider.STRIPE:
        return <StripeEmbed />;
      case OnRampProvider.RAMP:
        const rampConfig = onRampConfig.providers.find(
          ({ id }) => getProvider(id) === OnRampProvider.RAMP,
        ) as unknown as RampConfig;

        return <RampEmbed hostApiKey={rampConfig.hostApiKey} />;
    }
  }, [onRampPurchase?.provider]);

  useEffect(() => {
    let timeoutId;

    if (onRampPurchase?.status && ['CANCELLED', 'FINISHED'].includes(onRampPurchase.status)) {
      timeoutId = setTimeout(() => {
        setStep(STEPS[onRampPurchase.status]);
      }, 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [onRampPurchase?.status]);

  return <MainContainer>{onRampEmbed}</MainContainer>;
};
