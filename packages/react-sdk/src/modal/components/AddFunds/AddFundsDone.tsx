import styled from 'styled-components';
import { AddFundsButton, Heading, HeroNoSpacing, MainContainer, SecondaryText } from '../common.js';
import { useModalStore } from '../../stores/index.js';
import { useMemo } from 'react';
import { CpslButton } from '@usecapsule/react-components';
import { ModalStep } from '../../utils/steps.js';

interface AddFundsDoneProps {
  isSuccess?: boolean;
  onClose: () => void;
}

export const AddFundsDone = ({ isSuccess, onClose }: AddFundsDoneProps) => {
  const setStep = useModalStore((state) => state.setStep);
  const onRampPurchase = useModalStore((state) => state.onRampPurchase);

  const formatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: onRampPurchase.fiatCurrency || 'USD',
    });
  }, [onRampPurchase.fiatCurrency]);

  const [hero, heading, text, buttons] = isSuccess
    ? [
        <SuccessIcon icon="check" />,
        <SuccessHeading>Funds Added</SuccessHeading>,
        onRampPurchase.fiatCurrency ? (
          <SecondaryText>
            {formatter.format(parseFloat(onRampPurchase.fiatQuantity))} has been added to your wallet.
          </SecondaryText>
        ) : null,
        <>
          <CpslButton fullWidth onClick={onClose}>
            Done
          </CpslButton>
          <AddFundsButton text="Add More Funds" />
        </>,
      ]
    : [
        <FailureIcon icon="alertCircle" />,
        <FailureHeading>Something Went Wrong</FailureHeading>,
        <SecondaryText>No funds were added to your wallet.</SecondaryText>,
        <CpslButton
          fullWidth
          onClick={() => {
            setStep(ModalStep.ADD_FUNDS);
          }}
        >
          Try Again
        </CpslButton>,
      ];
  return (
    <>
      {hero}
      <MainContainer>
        {heading}
        {text}
      </MainContainer>
      {buttons}
    </>
  );
};

const SuccessIcon = styled(HeroNoSpacing)`
  --icon-color: #34a853;
  --icon-fill-color: #34a853;
  --icon-stroke-color: #34a853;

  svg {
    stroke: #34a853;
  }
`;

const FailureIcon = styled(HeroNoSpacing)`
  --icon-color: #f04438;
  --icon-fill-color: #f04438;
  --icon-stroke-color: #f04438;

  svg {
    stroke: #f04438;
  }
`;

const SuccessHeading = styled(Heading)`
  color: #34a853;
`;

const FailureHeading = styled(Heading)`
  color: #f04438;
`;
