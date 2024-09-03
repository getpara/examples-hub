import { OnRampConfig, OnRampMethod } from '@usecapsule/web-sdk';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { useEffect, useMemo, useState } from 'react';
import { ON_RAMP_PROVIDERS, OnRampProviderConfig } from '../../constants/constants.js';
import { ModalStep } from '../../utils/steps.js';
import styled from 'styled-components';
import { CpslButton, CpslIcon, CpslSpinner, CpslText } from '@usecapsule/react-components';

interface OnRampButtonProps {
  config: OnRampConfig;
  index: number;
  isLoading?: boolean;
}

export const OnRampProviderButton = ({ config, index }: OnRampButtonProps) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const setStep = useModalStore(state => state.setStep);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);

  const [isLoading, setIsLoading] = useState(false);

  const provider = config.providers[index];
  const { feeLower, feeUpper, methods, name, icon, backgroundColors }: OnRampProviderConfig = ON_RAMP_PROVIDERS[provider.id];

  const feeString = `Fee ${feeLower}% - ${feeUpper}%`;
  const PaymentIcons = useMemo(() => {
    const Icons: JSX.Element[] = [];

    if (methods.includes(OnRampMethod.DEBIT) || methods.includes(OnRampMethod.CREDIT)) {
      Icons.push(<StyledIcon key="creditCard" icon="creditCard" />);
    }
    if (methods.includes(OnRampMethod.ACH)) {
      Icons.push(<StyledIcon key="bank" icon="bank" />);
    }

    return Icons;
  }, []);

  const onClick = async () => {
    setIsLoading(true);

    const newOnRampPurchase = await capsule.createOnRampPurchase({
      provider: provider.id,
      network: config.network,
      asset: config.asset,
      testMode: config.testMode,
    });
    setOnRampPurchase(newOnRampPurchase);

    setStep(ModalStep.ADD_FUNDS_AWAITING);
  };

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  return (
    <StyledButton $gradientColors={backgroundColors} fullWidth onClick={onClick}>
      <Container $backgroundColor={backgroundColors[1]}>
        <IconContainer>{icon}</IconContainer>
        <ProviderInfoContainer>
          <Text variant="bodyL" weight="medium">
            {name}
          </Text>
          <ProviderInfoInnerContainer>
            <Text variant="bodyXS" weight="medium">
              {feeString}
            </Text>
            <ProviderInfoIconContainer>
              <Text variant="bodyXS" weight="medium">
                Accepts
              </Text>
              {PaymentIcons}
            </ProviderInfoIconContainer>
          </ProviderInfoInnerContainer>
        </ProviderInfoContainer>
        {isLoading ? <CpslSpinner size={16} /> : <Chevron icon="chevronUp" />}
      </Container>
    </StyledButton>
  );
};

const StyledButton = styled(CpslButton)<{ $gradientColors: string[] }>`
  --button-primary-background-color: ${({ $gradientColors }) =>
    `linear-gradient(90deg, ${$gradientColors[0]} 0%, ${$gradientColors[1]} 100%)`};
  --button-primary-hover-background-color: ${({ $gradientColors }) =>
    `linear-gradient(90deg, ${$gradientColors[0]} 0%, ${$gradientColors[0]} 100%)`};
  --button-primary-active-background-color: ${({ $gradientColors }) =>
    `linear-gradient(90deg, ${$gradientColors[0]} 0%, ${$gradientColors[0]} 100%)`};
`;

const Container = styled.div<{ $backgroundColor: string }>`
  display: flex;
  gap: 4px;
  flex: 1;
  align-items: center;

  & cpsl-spinner {
    --background-color: ${({ $backgroundColor }) => `${$backgroundColor}`};
  }
`;

const ProviderInfoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 2px;
`;

const ProviderInfoInnerContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 100%;
  height: 48px;
  width: 48px;
`;

const Text = styled(CpslText)`
  color: #fff;
`;

const ProviderInfoIconContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
`;

const StyledIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: #fff;
`;

const Chevron = styled(CpslIcon)`
  transform: rotate(90deg);
  --icon-color: #fff;
`;
