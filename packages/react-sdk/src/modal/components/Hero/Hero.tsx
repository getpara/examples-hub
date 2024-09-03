import { CpslHero, CpslIcon, CpslIdenticon } from '@usecapsule/react-components';
import styled from 'styled-components';
import { ModalStep } from '../../utils/steps';
import { useModalStore } from '../../stores';
import { useExternalWallets } from '../../providers/ExternalWalletContext';
import { NETWORK_NOT_SUPPORTED_ERROR } from '../../constants/constants';
import { useEffect, useState } from 'react';
import { useWallet } from '../../providers/WalletContext';
import { isMobile } from '@usecapsule/web-sdk';

type StepHeroConfig = {
  variant: 'externalWalletConnection' | 'approved' | 'failed' | 'customContent';
  topOffset: number;
  spacerHeight: number;
  hideFadeOut?: boolean;
};

const getStepConfig = ({
  externalWalletError,
}: {
  externalWalletError?: string[];
}): Record<
  | `${ModalStep.WALLET_CREATION_DONE}`
  | `${ModalStep.EX_WALLET_SELECTED}`
  | `${ModalStep.LOGIN_DONE}`
  | `${ModalStep.TWO_FACTOR_DONE}`
  | `${ModalStep.ADD_FUNDS_SUCCESS}`
  | `${ModalStep.CHAIN_SWITCH}`
  | `${ModalStep.ACCOUNT_MAIN}`,
  StepHeroConfig
> => ({
  [ModalStep.WALLET_CREATION_DONE]: { variant: 'approved', topOffset: 20, spacerHeight: 158 },
  [ModalStep.LOGIN_DONE]: { variant: 'approved', topOffset: 20, spacerHeight: 158 },
  [ModalStep.EX_WALLET_SELECTED]: {
    variant: 'externalWalletConnection',
    topOffset: 40,
    spacerHeight: 158,
    hideFadeOut: true,
  },
  [ModalStep.TWO_FACTOR_DONE]: { variant: 'approved', topOffset: 40, spacerHeight: 158 },
  [ModalStep.ADD_FUNDS_SUCCESS]: { variant: 'approved', topOffset: 40, spacerHeight: 158 },
  [ModalStep.CHAIN_SWITCH]: {
    variant: externalWalletError?.[0]?.toLowerCase() === NETWORK_NOT_SUPPORTED_ERROR ? 'failed' : 'externalWalletConnection',
    topOffset: 20,
    spacerHeight: 158,
    hideFadeOut: true,
  },
  [ModalStep.ACCOUNT_MAIN]: {
    variant: 'customContent',
    topOffset: 0,
    spacerHeight: 104,
    hideFadeOut: true,
  },
});

export const Hero = () => {
  const { wallet: connector, walletDisplayHelpers, avatar } = useExternalWallets();
  const step = useModalStore(state => state.step);
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const { wallet } = useWallet();

  const [currentStep, setCurrentStep] = useState(step);
  const [walletAddress, setWalletAddress] = useState(wallet?.address);

  const stepConfig: StepHeroConfig | undefined = getStepConfig({
    externalWalletError,
  })[currentStep];

  useEffect(() => {
    if (wallet?.address && wallet.address !== walletAddress) {
      setWalletAddress(wallet?.address);
    }
  }, [wallet?.address]);

  // Watching the step here to make the animation in/out of the hero look correct
  useEffect(() => {
    const prevStepConfig = getStepConfig({
      externalWalletError,
    })[currentStep];
    const newStepConfig = getStepConfig({
      externalWalletError,
    })[step];

    const delay = newStepConfig && prevStepConfig ? 0 : newStepConfig && !prevStepConfig ? 0 : 200;

    setTimeout(() => {
      setCurrentStep(step);
    }, delay);
  }, [step]);

  const isExternalStep = currentStep === ModalStep.EX_WALLET_SELECTED;
  const isChainSwitchStep = currentStep === ModalStep.CHAIN_SWITCH;
  const isAccountStep = currentStep === ModalStep.ACCOUNT_MAIN;

  const { showExtension, isCosmosMobileWallet } = walletDisplayHelpers;

  // Hide if:
  // 1. On a step with no hero config
  // 2. On the external wallet step and not showing the extension connection screen
  // 3. On the network switch step on web for Cosmos mobile connectors
  const shouldHide =
    !stepConfig ||
    (!isMobile() && isExternalStep && !showExtension) ||
    (!isMobile() && isChainSwitchStep && isCosmosMobileWallet);

  const { variant, topOffset, spacerHeight, hideFadeOut } = stepConfig ?? {};

  return (
    <>
      <Container $top={-45 + topOffset}>
        {shouldHide ? null : (
          <StyledHero $isAccount={isAccountStep} hideFadeOut={hideFadeOut} variant={variant} height={480} withDefaultTheme>
            {(isExternalStep || isChainSwitchStep) && <WalletLogo slot="connectionLeft" src={connector?.iconUrl} />}
            {isAccountStep &&
              (avatar ? (
                <Avatar slot="image" src={avatar} />
              ) : walletAddress ? (
                <IconAvatar slot="image" hash={walletAddress} />
              ) : null)}
          </StyledHero>
        )}
      </Container>
      {!shouldHide && <Spacer $height={spacerHeight} />}
    </>
  );
};

const Container = styled.div<{ $top: number }>`
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  width: 100%;

  top: ${({ $top }) => `${$top}px`};
`;

const Spacer = styled.div<{ $height: number }>`
  height: ${({ $height }) => `${$height}px`};
`;

const WalletLogo = styled(CpslIcon)`
  --height: 60px;
  --width: 60px;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const IconAvatar = styled(CpslIdenticon)`
  width: 100%;
  height: 100%;
  border-radius: 1000px;
`;

const StyledHero = styled(CpslHero)<{ $isAccount: boolean }>`
  ${({ $isAccount }) =>
    $isAccount &&
    `
      --ring-3-size: 560px;
      --ring-2-size: 402px;
      --ring-1-size: 228px;
      --ring-0-size: 104px;
      
      --default-theme-ring-3-opacity: 0.02;
      --default-theme-ring-2-opacity: 0.04;
      --default-theme-ring-1-opacity: 0.06;
      --default-theme-ring-0-opacity: 0.1;
  `}
`;
