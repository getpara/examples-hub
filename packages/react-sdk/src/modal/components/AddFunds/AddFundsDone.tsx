import { Heading, InnerStepContainer, StepContainer } from '../common.js';
import { useModalStore } from '../../stores/index.js';
import { useMemo } from 'react';
import { CpslButton, CpslText } from '@usecapsule/react-components';
import { ModalStep } from '../../utils/steps.js';

interface AddFundsDoneProps {
  isSuccess?: boolean;
  onClose: () => void;
}

export const AddFundsDone = ({ isSuccess, onClose }: AddFundsDoneProps) => {
  const setStep = useModalStore(state => state.setStep);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);

  const formatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: onRampPurchase?.fiatCurrency || 'USD',
    });
  }, [onRampPurchase?.fiatCurrency]);

  const heading = isSuccess ? 'Transaction Successful' : 'Something Went Wrong';
  const text = isSuccess
    ? `${formatter.format(parseFloat(onRampPurchase?.fiatQuantity))} is now available in your wallet.`
    : 'No funds were added to your wallet.';
  const buttonText = isSuccess ? 'Done' : 'Try Again';

  return (
    <StepContainer>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          {heading}
        </Heading>
        <CpslText variant="bodyS" color="secondary">
          {text}
        </CpslText>
      </InnerStepContainer>
      <CpslButton
        fullWidth
        onClick={() => {
          isSuccess ? onClose() : setStep(ModalStep.ADD_FUNDS);
        }}
      >
        {buttonText}
      </CpslButton>
    </StepContainer>
  );
};
