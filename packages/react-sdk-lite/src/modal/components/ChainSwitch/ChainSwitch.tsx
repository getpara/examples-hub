import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { HeroAccountTypeIcon, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useEffect, useMemo } from 'react';
import { useModalStore } from '../../stores/index.js';
import { HeroSpinner, safeStyled } from '@getpara/react-common';
import { useCopyToClipboard } from '@getpara/react-common';
import { ModalStep } from '../../utils/steps.js';
import { routeMobileExternalWallet } from '../../utils/routeMobileExternalWallet.js';
import { NETWORK_NOT_SUPPORTED_ERROR } from '../../constants/constants.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';

export const ChainSwitch = () => {
  const [isCopied, copy] = useCopyToClipboard();
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const setStep = useModalStore(state => state.setStep);
  const setStepDirection = useModalStore(state => state.setStepDirection);
  const { switchChain, wallet, qrUri, chainIdSwitchingTo, walletDisplayHelpers } = useExternalWallets();

  useEffect(() => {
    if (wallet?.type === 'COSMOS') {
      routeMobileExternalWallet(qrUri);
    }
  }, [qrUri, wallet]);

  useEffect(() => {
    if (!wallet) {
      setStepDirection(-1);
      setStep(ModalStep.ACCOUNT_MAIN);
    }
  }, [wallet]);

  const handleTryAgainClick = async () => {
    if (chainIdSwitchingTo) {
      await switchChain(chainIdSwitchingTo);
    }
  };

  const handleCopy = () => {
    if (qrUri) {
      copy(qrUri);
    }
  };

  const Content = useMemo(() => {
    if (!wallet) {
      return null;
    }

    const { isCosmosMobileWallet } = walletDisplayHelpers;

    if (isCosmosMobileWallet) {
      return (
        <>
          <InnerStepContainer>
            <CpslText weight="semiBold">Scan with your mobile device to switch networks</CpslText>
            <QRContainer>
              {!qrUri ? <CpslSpinner size={100} /> : <CpslQrCode url={qrUri} imageSrc={wallet.iconUrl} />}
            </QRContainer>
            <CpslButton size="small" variant="ghost" onClick={handleCopy}>
              <CpslIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
              {isCopied ? 'Copied' : 'Copy Link'}
            </CpslButton>
          </InnerStepContainer>
        </>
      );
    }

    const isError = !!externalWalletError?.[0];
    return (
      <InnerStepContainer>
        <HeroSpinner
          icon={<HeroAccountTypeIcon accountType={wallet.internalId} src={wallet ? wallet.iconUrl : undefined} />}
          status={isError ? 'error' : 'pending'}
          text={isError ? externalWalletError[0] : `Confirm the request to change networks in your ${wallet.name} wallet.`}
          secondaryText={externalWalletError?.[1]}
        />
        {externalWalletError?.[0]?.toLowerCase() !== NETWORK_NOT_SUPPORTED_ERROR && (
          <CpslButton fullWidth variant="secondary" onClick={handleTryAgainClick}>
            <CpslIcon slot="start" icon="refresh" />
            Try Again
          </CpslButton>
        )}
      </InnerStepContainer>
    );
  }, [wallet, walletDisplayHelpers, externalWalletError, qrUri]);

  if (!wallet) {
    return null;
  }

  return <Container>{Content}</Container>;
};

const Container = safeStyled(StepContainer)`
  flex: 1;
  justify-content: space-between;
`;
