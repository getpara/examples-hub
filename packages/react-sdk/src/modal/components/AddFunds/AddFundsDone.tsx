import { Heading, HeroIcon, InnerStepContainer, StepContainer } from '../common.js';
import { useModalStore } from '../../stores/index.js';
import { useMemo } from 'react';
import { CpslButton, CpslText } from '@getpara/react-components';
import { getAddFundsStep } from '../../utils/steps.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { EnabledFlow } from '@getpara/web-sdk';

interface AddFundsDoneProps {
  isSuccess?: boolean;
  onClose: () => void;
}

export const AddFundsDone = ({ isSuccess, onClose }: AddFundsDoneProps) => {
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const setStep = useModalStore(state => state.setStep);
  const onRampPurchase = useModalStore(state => state.onRampPurchase);
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);

  const formatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: onRampPurchase?.fiat || 'USD',
    });
  }, [onRampPurchase?.fiat]);

  const heading = isSuccess ? 'Transaction Successful' : 'Something Went Wrong';
  const text = isSuccess
    ? `${formatter.format(parseFloat(onRampPurchase?.fiatQuantity ?? '0'))} is now available in your ${hideWallets ? 'account' : 'wallet'}.`
    : `No funds were added to your ${hideWallets ? 'account' : 'wallet'}.`;
  const buttonText = isSuccess ? 'Done' : 'Try Again';

  return (
    <StepContainer>
      <HeroIcon icon="checkCircleFilled" />
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
          isSuccess ? onClose() : setStep(getAddFundsStep(accountAddFundTab ?? EnabledFlow.BUY));
        }}
      >
        {buttonText}
      </CpslButton>
    </StepContainer>
  );
};
