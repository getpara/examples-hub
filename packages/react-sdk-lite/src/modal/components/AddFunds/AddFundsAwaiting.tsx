import { useModalStore } from '../../stores/index.js';
import { useEffect } from 'react';
import { ModalStep } from '../../utils/steps.js';

const STEPS = {
  CANCELLED: ModalStep.ADD_FUNDS_FAILURE,
  FINISHED: ModalStep.ADD_FUNDS_SUCCESS,
};

export const AddFundsAwaiting = () => {
  const setStep = useModalStore(state => state.setStep);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);

  useEffect(() => {
    let timeoutId;

    if (onRampPurchase?.status && ['CANCELLED', 'FINISHED'].includes(onRampPurchase.status)) {
      timeoutId = setTimeout(() => {
        setStep(STEPS[onRampPurchase.status ?? '']);
      }, 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [onRampPurchase?.status]);

  return null;
};
