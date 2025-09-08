import { safeStyled } from '@getpara/react-common';
import { InnerStepContainer, StepContainer } from '../common.js';
import { CpslButton, CpslIcon, CpslSpinner, CpslText, CpslTileButton } from '@getpara/react-components';
import { OnRampStep, useModalStore } from '../../stores/index.js';
import { useEffect } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useAccount } from '../../../provider/index.js';
import { EnabledFlow } from '@getpara/web-sdk';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { useAssets } from '../../../provider/providers/AssetsProvider.js';
import { AccountHeader } from './AccountHeader.js';

export const Account = () => {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const setStep = useModalStore(state => state.setStep);
  const setGuestAddFundsTab = useModalStore(state => state.setGuestAddFundsTab);
  const setOnRampStep = useModalStore(state => state.setOnRampStep);
  const para = useInternalClient();
  const { embedded } = useAccount();
  const { isEnabled } = useAccountLinking();
  const { profileBalance } = useAssets();

  const isGuestMode = embedded.isConnected && embedded.isGuestMode;
  // Users using external wallets with connection only can't buy or withdraw
  // CONNECTION_ONLY wallets with no userId are wallets that have skipped Para and can't buy or withdraw
  const cantBuyAndWithdraw =
    (para.externalWalletConnectionType === 'CONNECTION_ONLY' || para.externalWalletConnectionType === 'VERIFICATION') &&
    !para.userId;
  const isOnRampLoaded = !!onRampConfig;

  const handleBuyClick = () => {
    if (isGuestMode) {
      if (onRampConfig?.isReceiveEnabled) {
        setStep(ModalStep.ADD_FUNDS_RECEIVE);
      } else {
        setGuestAddFundsTab(EnabledFlow.BUY);
        setStep(ModalStep.AUTH_GUEST_SIGNUP);
      }
    } else if (onRampConfig?.isBuyEnabled || onRampConfig?.isReceiveEnabled) {
      setOnRampStep(OnRampStep.SETTINGS);
      setStep(onRampConfig?.isBuyEnabled ? ModalStep.ADD_FUNDS_BUY : ModalStep.ADD_FUNDS_RECEIVE);
    }
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

  const handleProfileClick = () => {
    setStep(ModalStep.ACCOUNT_PROFILE);
  };

  useEffect(() => {
    setGuestAddFundsTab();
  }, []);

  return (
    <StepContainer $wide>
      <$InnerStepContainer>
        <AccountHeader withBalance />
        <LowerContainer>
          {isGuestMode && (
            <>
              {profileBalance && profileBalance.value && profileBalance.value.value > 0 && (
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
                {(onRampConfig.isBuyEnabled || onRampConfig.isReceiveEnabled) && !cantBuyAndWithdraw && (
                  <OptionButton icon="plusCircle" onClick={handleBuyClick}>
                    <CpslText variant="bodyXS" color="secondary" weight="medium">
                      Add Funds
                    </CpslText>
                  </OptionButton>
                )}
                {onRampConfig.isWithdrawEnabled && !cantBuyAndWithdraw && (
                  <OptionButton icon="arrowCircleDown" onClick={handleSellClick}>
                    <CpslText variant="bodyXS" color="secondary" weight="medium">
                      Withdraw
                    </CpslText>
                  </OptionButton>
                )}
                <OptionButton icon="user01" onClick={handleProfileClick}>
                  <CpslText variant="bodyXS" color="secondary" weight="medium">
                    {isEnabled ? 'Profile' : 'Settings'}
                  </CpslText>
                </OptionButton>
              </>
            ) : (
              <CpslSpinner />
            )}
          </ButtonContainer>
        </LowerContainer>
      </$InnerStepContainer>
    </StepContainer>
  );
};

const ButtonContainer = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

const OptionButton = safeStyled(CpslTileButton)`
  --button-gap: 4px;
  --button-width: 100%;
  --button-icon-height: 24px;
  --button-icon-width: 24px;
  --button-padding-top: 12px;
  --button-padding-bottom: 12px;
  --button-icon-color: var(--cpsl-color-text-contrast);
  --button-height: auto;
  flex: 1;
`;

const $InnerStepContainer = safeStyled(InnerStepContainer)`
  gap: 24px;
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

const LowerContainer = safeStyled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;
