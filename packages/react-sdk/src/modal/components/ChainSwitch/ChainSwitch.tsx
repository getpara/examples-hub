import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { CenteredText, InnerStepContainer, QRContainer, StepContainer } from '../common';
import { useEffect, useMemo } from 'react';
import { useModalStore } from '../../stores';
import styled from 'styled-components';
import { useExternalWallets } from '../../providers/ExternalWalletContext';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { ModalStep } from '../../utils/steps';
import { routeMobileExternalWallet } from '../../utils/routeMobileExternalWallet';
import { NETWORK_NOT_SUPPORTED_ERROR } from '../../constants/constants';
import { WalletType } from '@usecapsule/web-sdk';

export const ChainSwitch = () => {
  const [isCopied, copy] = useCopyToClipboard();
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const setStep = useModalStore(state => state.setStep);
  const setStepDirection = useModalStore(state => state.setStepDirection);
  const { switchChain, wallet, qrUri, chainIdSwitchingTo, walletDisplayHelpers } = useExternalWallets();

  if (!wallet) {
    setStepDirection(-1);
    setStep(ModalStep.ACCOUNT_MAIN);
  }

  useEffect(() => {
    if (wallet.type === WalletType.COSMOS) {
      routeMobileExternalWallet(qrUri);
    }
  }, [qrUri]);

  const handleTryAgainClick = async () => {
    if (chainIdSwitchingTo) {
      await switchChain(chainIdSwitchingTo);
    }
  };

  const handleCopy = () => {
    copy(qrUri);
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

    return (
      <InnerStepContainer>
        {!externalWalletError?.length ? (
          <CenteredText color="contrast" weight="semiBold">
            {`Confirm the request to change networks in your ${wallet.name} wallet.`}
          </CenteredText>
        ) : (
          <>
            <ErrorContainer>
              <ErrorIcon icon="alertCircle" />
              <CenteredText weight="semiBold" color="error">
                {externalWalletError[0]}
              </CenteredText>
            </ErrorContainer>
            {externalWalletError[1] && (
              <CenteredText color="secondary" weight="medium">
                {externalWalletError[1]}
              </CenteredText>
            )}
          </>
        )}
        {externalWalletError?.[0].toLowerCase() !== NETWORK_NOT_SUPPORTED_ERROR && (
          <CpslButton variant="secondary" onClick={handleTryAgainClick}>
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

const Container = styled(StepContainer)`
  flex: 1;
  justify-content: space-between;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const ErrorIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-error);
`;
