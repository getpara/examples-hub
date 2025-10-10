import { CpslHero, CpslIcon, CpslIdenticon } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import { ModalStep } from '../../utils/steps.js';
import { useModalStore } from '../../stores/index.js';
import { NETWORK_NOT_SUPPORTED_ERROR } from '../../constants/constants.js';
import { useEffect, useState } from 'react';
import { isMobile } from '@getpara/web-sdk';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useWallet } from '../../../provider/index.js';

type StepHeroConfig = {
  variant: 'externalWalletConnection' | 'approved' | 'failed' | 'customContent' | 'pending';
  topOffset: number;
  spacerHeight: number;
  hideFadeOut?: boolean;
};

const getStepConfig = ({
  externalWalletError,
}: {
  externalWalletError?: string[];
}): Record<
  `${ModalStep.EX_WALLET_SELECTED}` | `${ModalStep.CHAIN_SWITCH}` | `${ModalStep.FARCASTER_OAUTH}`,
  StepHeroConfig
> => ({
  [ModalStep.EX_WALLET_SELECTED]: {
    variant: 'externalWalletConnection',
    topOffset: 40,
    spacerHeight: 158,
    hideFadeOut: true,
  },
  [ModalStep.CHAIN_SWITCH]: {
    variant: externalWalletError?.[0]?.toLowerCase() === NETWORK_NOT_SUPPORTED_ERROR ? 'failed' : 'externalWalletConnection',
    topOffset: 20,
    spacerHeight: 158,
    hideFadeOut: true,
  },
  [ModalStep.FARCASTER_OAUTH]: {
    variant: 'externalWalletConnection',
    topOffset: 40,
    spacerHeight: 158,
    hideFadeOut: true,
  },
});

export const Hero = () => {
  const para = useInternalClient();
  const { wallet: connector, walletDisplayHelpers, avatar } = useExternalWallets();
  const step = useModalStore(state => state.step);
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const { data: activeWallet } = useWallet();

  const [currentStep, setCurrentStep] = useState(step);

  const stepConfig: StepHeroConfig | undefined = getStepConfig({
    externalWalletError,
  })[currentStep];

  // Watching the step here to make the animation in/out of the hero look correct
  useEffect(() => {
    const prevStepConfig = getStepConfig({
      externalWalletError,
    })[currentStep];
    const newStepConfig = getStepConfig({
      externalWalletError,
    })[step];

    const delay = newStepConfig && prevStepConfig ? 0 : newStepConfig && !prevStepConfig ? 0 : 200;

    const timerId = setTimeout(() => {
      setCurrentStep(step);
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [step]);

  const isExternalStep = currentStep === ModalStep.EX_WALLET_SELECTED;
  const isChainSwitchStep = currentStep === ModalStep.CHAIN_SWITCH;
  const isAccountStep = currentStep === ModalStep.ACCOUNT_MAIN;
  const isFarcasterStep = currentStep === ModalStep.FARCASTER_OAUTH;

  const { showExtension, isCosmosMobileWallet } = walletDisplayHelpers;

  // Hide if:
  // 1. On a step with no hero config
  // 2. On the external wallet step and not showing the extension connection screen
  // 3. On the network switch step on web for Cosmos mobile connectors
  // 4. On the farcaster step on desktop
  const shouldHide =
    !stepConfig ||
    (!isMobile() && isExternalStep && !showExtension) ||
    (!isMobile() && isChainSwitchStep && isCosmosMobileWallet) ||
    (!isMobile() && isFarcasterStep);

  const { variant, topOffset, spacerHeight, hideFadeOut } = stepConfig ?? {};

  return (
    <>
      <Container $top={-45 + (topOffset ?? 0)}>
        {shouldHide ? null : (
          <StyledHero $isAccount={isAccountStep} hideFadeOut={hideFadeOut} variant={variant} height={480} withDefaultTheme>
            {(isExternalStep || isChainSwitchStep) && <WalletLogo slot="connectionLeft" src={connector?.iconUrl} />}
            {isFarcasterStep && <WalletLogo slot="connectionLeft" icon="farcasterBrand" />}
            {isAccountStep &&
              (avatar ? (
                <Avatar slot="image" src={avatar} />
              ) : activeWallet ? (
                <IconAvatar slot="image" size="100%" hash={para.getIdenticonHash(activeWallet.id, activeWallet.type)} />
              ) : null)}
          </StyledHero>
        )}
      </Container>
      {!shouldHide && <Spacer $height={spacerHeight ?? 0} />}
    </>
  );
};

const Container = safeStyled.div<{ $top: number }>`
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  width: 100%;

  top: ${({ $top }) => `${$top}px`};
`;

const Spacer = safeStyled.div<{ $height: number }>`
  height: ${({ $height }) => `${$height}px`};
`;

const WalletLogo = safeStyled(CpslIcon)`
  --height: 60px;
  --width: 60px;
`;

const Avatar = safeStyled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const IconAvatar = safeStyled(CpslIdenticon)`
  border-radius: 1000px;
`;

const StyledHero = safeStyled(CpslHero)<{ $isAccount: boolean }>`
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
