import { OnRampConfig } from '@usecapsule/web-sdk';
import { useModalStore } from '../stores/index.js';
import { useInitializeOnRamp } from './useInitializeOnRamp.js';
import { ModalStep } from '../utils/steps.js';

export function useOnClickAddFunds(config?: OnRampConfig): () => void {
  const setStep = useModalStore((state) => state.setStep);

  if (!config || config.providers.length < 1) {
    return () => {};
  }

  const defaultFlow = useInitializeOnRamp(config.providers[0], config.asset, config.testMode);

  if (config.providers.length === 1) {
    return defaultFlow;
  } else {
    return () => {
      setStep(ModalStep.ADD_FUNDS);
    };
  }
}
