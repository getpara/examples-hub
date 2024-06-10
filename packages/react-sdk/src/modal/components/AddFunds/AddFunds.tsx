import { OnRampConfig } from '@usecapsule/web-sdk';
import { Heading, MainContainer, SecondaryText } from '../common.js';
import styled from 'styled-components';
import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { useModalStore } from '../../stores/index.js';
import { ON_RAMP_PROVIDERS } from '../../constants/constants.js';
import { useEffect } from 'react';
import { useInitializeOnRamp } from '../../hooks/useInitializeOnRamp.js';

interface OnRampButtonProps {
  config: OnRampConfig;
  index: number;
}

const OnRamp = ({ config, index }: OnRampButtonProps) => {
  const setOnRampPurchase = useModalStore((state) => state.setOnRampPurchase);

  const provider = config.providers[index];
  const { feeLower, feeUpper, methods, name, icon } = ON_RAMP_PROVIDERS[provider.id];

  const onClick = useInitializeOnRamp(provider, config.asset, config.testMode);

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  return (
    <OnRampButton variant="secondary" onClick={onClick}>
      <OnRampButtonContainer>
        <OnRampButtonUpper>
          <OnRampName>
            {icon}
            {name}
          </OnRampName>
          <RightArrowIcon icon="arrow" />
        </OnRampButtonUpper>
        <OnRampButtonLower>
          <OnRampStat>
            Fee: {feeUpper !== undefined ? `${feeLower.toFixed(2)}-${feeUpper.toFixed(2)}%` : `${feeLower.toFixed(2)}%`}
          </OnRampStat>
          <OnRampStat>{methods.map((m) => m.toString()).join(', ')}</OnRampStat>
          <OnRampStat>
            <CpslIcon icon="lightning" />
            Instant
          </OnRampStat>
        </OnRampButtonLower>
      </OnRampButtonContainer>
    </OnRampButton>
  );
};

export const AddFunds = () => {
  const onRampConfig = useModalStore((state) => state.onRampConfig);

  return (
    <>
      <MainContainer>
        <Heading>
          <span>Add Funds</span>
        </Heading>
        <SecondaryText>
          <span>Choose a provider to fund your wallet.</span>
        </SecondaryText>
      </MainContainer>
      {onRampConfig.providers.map((provider, index) => {
        return <OnRamp config={onRampConfig} index={index} key={provider.id} />;
      })}
    </>
  );
};

const OnRampButton = styled(CpslButton)`
  --button-padding-top: 16px;
  --button-padding-left: 16px;
  --button-padding-right: 16px;
  --button-padding-bottom: 16px;
  --button-box-shadow: none;
  --cpsl-color-secondary-button-border-default: #d6d6d6;
  --cpsl-color-secondary-button-surface-hover: #f5f5f5;
`;

const OnRampButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const OnRampButtonUpper = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RightArrowIcon = styled(CpslIcon)`
  --icon-color: var(--);
`;

const OnRampButtonLower = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OnRampName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
`;

const OnRampStat = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
  font-size: 12px;

  cpsl-icon {
    --height: 14px;
    --width: 14px;
  }
`;
