import { safeStyled } from '@getpara/react-common';
import { InnerStepContainer, StepContainer, StyledCpslTileButton } from '../common.js';
import { CpslButton, CpslIcon, CpslSpinner, CpslText } from '@getpara/react-components';
import { OnRampStep, useModalStore } from '../../stores/index.js';
import { useEffect, useState } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { formatBalanceString } from '../../utils/stringFormatters.js';
import { useAccount, useWalletBalance } from '../../../provider/index.js';
import { EnabledFlow } from '@getpara/web-sdk';

interface AccountProps {
  onClose: () => void;
}

export const Account = ({ onClose }: AccountProps) => {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const setStep = useModalStore(state => state.setStep);
  const setFlow = useModalStore(state => state.setFlow);
  const setGuestAddFundsTab = useModalStore(state => state.setGuestAddFundsTab);
  const setOnRampStep = useModalStore(state => state.setOnRampStep);
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const { disconnectExternalWallet } = useExternalWallets();
  const para = useInternalClient();
  const { data: account } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useWalletBalance();

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isGuestMode = account?.isConnected && account.isGuestMode;
  // Users using external wallets with connection only can't buy or withdraw
  // CONNECTION_ONLY wallets with no userId are wallets that have skipped Para and can't buy or withdraw
  const cantBuyAndWithdraw =
    (para.externalWalletConnectionType === 'CONNECTION_ONLY' || para.externalWalletConnectionType === 'VERIFICATION') &&
    !para.userId;
  const isOnRampLoaded = !!onRampConfig;

  const handleBuyClick = () => {
    if (isGuestMode) {
      setGuestAddFundsTab(EnabledFlow.BUY);
      setStep(ModalStep.AUTH_GUEST_SIGNUP);
    } else {
      setOnRampStep(OnRampStep.SETTINGS);
      setStep(ModalStep.ADD_FUNDS_BUY);
    }
  };

  const handleReceiveClick = () => {
    setStep(ModalStep.ADD_FUNDS_RECEIVE);
  };

  const handleSellClick = () => {
    if (isGuestMode) {
      setGuestAddFundsTab(EnabledFlow.WITHDRAW);
      setStep(ModalStep.AUTH_GUEST_SIGNUP);
    } else {
      setOnRampStep(OnRampStep.SETTINGS);
      setStep(ModalStep.ADD_FUNDS_WITHDRAW);
    }
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

  useEffect(() => {
    setGuestAddFundsTab();
  }, []);

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
        {isGuestMode && (
          <>
            {balance && parseFloat(balance) > 0 && (
              <Alert>
                <CpslIcon icon="alertTriangle" size="24px" style={{ color: 'var(--cpsl-color-utility-yellow)' }} />
                You've funded this account - complete account setup to maintain access.
              </Alert>
            )}
            <CpslButton
              fullWidth
              variant="primary"
              onClick={() => {
                setStep(ModalStep.AUTH_GUEST_SIGNUP);
              }}
            >
              <CpslIcon icon="stars02" />
              Complete Account Setup
            </CpslButton>
          </>
        )}
        <ButtonContainer>
          {isOnRampLoaded ? (
            <>
              {onRampConfig.isBuyEnabled && !cantBuyAndWithdraw && (
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
              {onRampConfig.isWithdrawEnabled && !cantBuyAndWithdraw && (
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
        {!isGuestMode && (
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
        )}
      </InnerStepContainer>
    </StepContainer>
  );
};

const ButtonContainer = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 88px;
`;

const OptionButton = safeStyled(StyledCpslTileButton)`
  flex: 1;

  --button-icon-color: var(--cpsl-color-text-primary);
`;

const DisconnectButton = safeStyled(CpslButton)`
  --button-border-width: 0px;
`;

const BalanceContainer = safeStyled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 24px;
`;

const Alert = safeStyled.div`
  --icon-color: var(--cpsl-color-utility-yellow);
  --icon-stroke-color: var(--cpsl-color-utility-yellow);
  --icon-fill-color: var(--cpsl-color-utility-yellow);

  display: flex;
  padding: 8px;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  border-radius: var(--cpsl-border-radius-alert);
  border: 1px solid var(--cpsl-color-utility-yellow);
  background: var(--cpsl-color-utility-yellow-light);
  font-size: 14px;
`;
