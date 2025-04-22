import styled from 'styled-components';
import { InnerStepContainer, StepContainer, StyledCpslTileButton } from '../common.js';
import { CpslButton, CpslIcon, CpslSpinner, CpslText } from '@getpara/react-components';
import { OnRampStep, useModalStore } from '../../stores/index.js';
import { useState } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { formatBalanceString } from '../../utils/stringFormatters.js';
import { useWalletBalance } from '../../../provider/index.js';

interface AccountProps {
  onClose: () => void;
}

export const Account = ({ onClose }: AccountProps) => {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const setStep = useModalStore(state => state.setStep);
  const setFlow = useModalStore(state => state.setFlow);
  const setOnRampStep = useModalStore(state => state.setOnRampStep);
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const { disconnectExternalWallet } = useExternalWallets();
  const para = useInternalClient();
  const { data: balance, isLoading: isBalanceLoading } = useWalletBalance();

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isOnRampLoaded = !!onRampConfig;
  const canBuyAndWithdraw = !!para.userId;

  const handleBuyClick = () => {
    setOnRampStep(OnRampStep.SETTINGS);
    setStep(ModalStep.ADD_FUNDS_BUY);
  };

  const handleReceiveClick = () => {
    setStep(ModalStep.ADD_FUNDS_RECEIVE);
  };

  const handleSellClick = () => {
    setOnRampStep(OnRampStep.SETTINGS);
    setStep(ModalStep.ADD_FUNDS_WITHDRAW);
  };

  const handleDisconnectClick = async () => {
    setIsDisconnecting(true);
    await para.logout();
    await disconnectExternalWallet();
    onClose();
    setStep(ModalStep.AUTH_MAIN);
    setFlow(undefined);
    setIsDisconnecting(false);
  };

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        {isBalanceLoading ? (
          <BalanceContainer>
            <CpslSpinner size={39} />
          </BalanceContainer>
        ) : (
          balance !== undefined &&
          balance !== null && (
            <BalanceContainer>
              <CpslText variant="headingS" weight="medium">
                {formatBalanceString(balance)}
              </CpslText>
            </BalanceContainer>
          )
        )}
        <ButtonContainer>
          {isOnRampLoaded ? (
            <>
              {canBuyAndWithdraw && onRampConfig.isBuyEnabled && (
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
              {canBuyAndWithdraw && onRampConfig.isWithdrawEnabled && (
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
              {hideWallets ? 'Logout' : 'Disconnect Wallet'}
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

const BalanceContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 24px;
`;
