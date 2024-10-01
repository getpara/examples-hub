import { OnRampConfig } from '@usecapsule/web-sdk';
import { useState } from 'react';
import { ON_RAMP_PROVIDERS, OnRampProviderConfig } from '../../constants/constants.js';
import styled from 'styled-components';
import { CpslButton, CpslIcon, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { motion } from 'framer-motion';

interface OnRampButtonProps {
  config: OnRampConfig;
  index: number;
  isLoading?: boolean;
  onClick: () => Promise<void>;
}

export const OnRampProviderButton = ({ config, index, onClick: _onClick }: OnRampButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const provider = config.providers[index];
  const { feeLower, feeUpper, name, icon, backgroundColors }: OnRampProviderConfig = ON_RAMP_PROVIDERS[provider];

  const feeString = `Fee ${feeLower}% - ${feeUpper}%`;

  const onClick = async () => {
    setIsLoading(true);

    await _onClick();

    setIsLoading(false);
  };

  return (
    <StyledButton $gradientColors={backgroundColors} fullWidth onClick={onClick}>
      <Container $backgroundColor={backgroundColors[1]}>
        <IconContainer>
          <CpslIcon icon={icon} />
        </IconContainer>
        <ProviderInfoContainer>
          <Text variant="bodyL" weight="medium">
            {name}
          </Text>
          <ProviderInfoInnerContainer>
            <Text variant="bodyXS" weight="medium">
              {feeString}
            </Text>
          </ProviderInfoInnerContainer>
        </ProviderInfoContainer>
        {isLoading ? <CpslSpinner size={16} /> : <Chevron icon="chevronUp" />}
      </Container>
    </StyledButton>
  );
};

const StyledButton = styled(CpslButton)<{ $gradientColors: string[] }>`
  width: 100%;
  --button-primary-background-color: ${({ $gradientColors }) =>
    `linear-gradient(90deg, ${$gradientColors[0]} 0%, ${$gradientColors[1]} 100%)`};
  --button-primary-hover-background-color: ${({ $gradientColors }) =>
    `linear-gradient(90deg, ${$gradientColors[0]} 0%, ${$gradientColors[0]} 100%)`};
  --button-primary-active-background-color: ${({ $gradientColors }) =>
    `linear-gradient(90deg, ${$gradientColors[0]} 0%, ${$gradientColors[0]} 100%)`};
`;

const Container = styled(motion.div)<{ $backgroundColor: string }>`
  display: flex;
  gap: 8px;
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
  &::part(text-element) {
    color: #fff;
  }
`;

const Chevron = styled(CpslIcon)`
  transform: rotate(90deg);
  --icon-color: #fff;
`;
