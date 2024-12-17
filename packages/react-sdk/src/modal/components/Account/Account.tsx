import styled from 'styled-components';
import { InnerStepContainer, StepContainer, StyledCpslTileButton } from '../common.js';
import { CpslButton, CpslIcon, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { useExternalWallets } from '../../providers/ExternalWalletContext.js';
import { useState } from 'react';
import { ModalStep } from '../../utils/steps.js';

interface AccountProps {
  onClose: () => void;
}

export const Account = ({ onClose }: AccountProps) => {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const setStep = useModalStore(state => state.setStep);
  const capsule = useCapsuleStore(state => state.capsule);
  const { disconnectExternalWallet } = useExternalWallets();

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isOnRampLoaded = !!onRampConfig;

  const handleBuyClick = () => {
    setStep(ModalStep.ADD_FUNDS_BUY);
  };

  const handleReceiveClick = () => {
    setStep(ModalStep.ADD_FUNDS_RECEIVE);
  };

  const handleSellClick = () => {
    setStep(ModalStep.ADD_FUNDS_WITHDRAW);
  };

  const handleDisconnectClick = async () => {
    setIsDisconnecting(true);
    await capsule.logout();
    await disconnectExternalWallet();
    onClose();
    setIsDisconnecting(false);
  };

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <ButtonContainer>
          {isOnRampLoaded ? (
            <>
              {onRampConfig.isBuyEnabled && (
                <OptionButton icon="creditCard" onClick={handleBuyClick}>
                  <CpslText variant="bodyXS" color="secondary" weight="medium">
                    Buy Crypto
                  </CpslText>
                </OptionButton>
              )}
              {onRampConfig.isReceiveEnabled && (
                <OptionButton icon="qrCode02" onClick={handleReceiveClick}>
                  <CpslText variant="bodyXS" color="secondary" weight="medium">
                    Receive
                  </CpslText>
                </OptionButton>
              )}
              {onRampConfig.isWithdrawEnabled && (
                <OptionButton icon="arrowCircleBrokenDownLeft" onClick={handleSellClick}>
                  <CpslText variant="bodyXS" color="secondary" weight="medium">
                    Withdraw
                  </CpslText>
                </OptionButton>
              )}
            </>
          ) : (
            <CpslSpinner />
          )}
        </ButtonContainer>
        <DisconnectButton variant="destructive" fullWidth onClick={handleDisconnectClick} disabled={isDisconnecting}>
          {isDisconnecting ? (
            <CpslSpinner size={16} />
          ) : (
            <>
              Disconnect Wallet
              <CpslIcon icon="logOut" slot="end" />
            </>
          )}
        </DisconnectButton>
      </InnerStepContainer>
    </StepContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 88px;
`;

const OptionButton = styled(StyledCpslTileButton)`
  flex: 1;

  --button-icon-color: var(--cpsl-color-text-primary);
`;

const DisconnectButton = styled(CpslButton)`
  --button-border-width: 0px;
`;
