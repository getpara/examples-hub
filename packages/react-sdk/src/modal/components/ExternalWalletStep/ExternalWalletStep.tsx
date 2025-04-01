import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { CenteredText, ErrorContainer, ErrorIcon, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useEffect, useMemo } from 'react';
import { useModalStore } from '../../stores/index.js';
import styled from 'styled-components';
import { useCopyToClipboard } from '@getpara/react-common';
import { ModalStep } from '../../utils/steps.js';
import { isMobile, isTablet, WalletType } from '@getpara/web-sdk';
import { routeMobileExternalWallet } from '../../utils/routeMobileExternalWallet.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';

export const ExternalWalletStep = () => {
  const [isCopied, copy] = useCopyToClipboard();
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const setStep = useModalStore(state => state.setStep);
  const { connectExternalWallet, wallet, qrUri, walletDisplayHelpers } = useExternalWallets();

  useEffect(() => {
    routeMobileExternalWallet(qrUri);
  }, [qrUri]);

  const handleTryAgainClick = async () => {
    if (wallet) {
      await connectExternalWallet(wallet);
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

    const isWalletConnect = wallet.id === 'walletConnect';
    const isMobileWalletConnect = isMobile() && isWalletConnect;

    if (isMobileWalletConnect) {
      <InnerStepContainer>
        <Text weight="semiBold">Continue in the WalletConnect modal.</Text>
      </InnerStepContainer>;
    }

    const { showExtension, showMobile, isSolanaMobileIOS } = walletDisplayHelpers;

    // Fallback to not supported text
    if ((!showMobile && !showExtension) || (isSolanaMobileIOS && !wallet.installed)) {
      const text = isSolanaMobileIOS
        ? "Solana wallets aren't available on mobile IOS browsers.\n\nPlease continue in the wallet app."
        : `${wallet.name} isn't supported on mobile devices.\n\nPlease choose another wallet or continue on desktop.`;

      return (
        <InnerStepContainer>
          <Text weight="semiBold">{text}</Text>
        </InnerStepContainer>
      );
    }

    if (showExtension) {
      const isInstalled = wallet.installed;
      return (
        <InnerStepContainer>
          {isInstalled && !externalWalletError?.length ? (
            <CenteredText color="contrast" weight="semiBold">
              {`Confirm connection request in the ${wallet.name} browser extension.`}
            </CenteredText>
          ) : (
            <ErrorContainer>
              <ErrorIcon icon="alertCircle" />
              <CpslText weight="semiBold" color="error">
                {isInstalled ? externalWalletError?.[0] : `${wallet.name} not detected`}
              </CpslText>
            </ErrorContainer>
          )}
          <CpslButton
            as={isInstalled ? 'button' : 'a'}
            href={wallet.downloadUrl ?? ''}
            target="_blank"
            variant="secondary"
            onClick={handleTryAgainClick}
          >
            <CpslIcon slot="start" icon={isInstalled ? 'refresh' : 'linkExternal'} />
            {isInstalled ? 'Try Again' : `Get ${wallet.name}`}
          </CpslButton>
        </InnerStepContainer>
      );
    }
    if (showMobile) {
      // If Solana wallet or if on a mobile and NOT on a table, show the connection screen. Else show the QR code.
      if (wallet.type === WalletType.SOLANA || (isMobile() && !isTablet())) {
        // Checking if the wallet is installed only for Solana wallets since Solana MWA doesn't work on IOS Safari
        // https://docs.solanamobile.com/web/developing-for-web#ios-web
        const isInstalled = wallet.type !== WalletType.SOLANA || wallet.installed;
        return (
          <>
            <InnerStepContainer>
              {!isInstalled && (
                <CpslText weight="semiBold" color="error">
                  {`${wallet.name} not detected`}
                </CpslText>
              )}
            </InnerStepContainer>
            {wallet.id !== 'walletConnect' && (
              <InnerStepContainer>
                <CpslButton onClick={() => routeMobileExternalWallet(qrUri)} fullWidth>
                  Connect Wallet
                </CpslButton>
                <Link href={wallet.downloadUrl ?? ''} target="_blank">
                  <ExternalButton variant="secondary">
                    {`Get ${wallet.name}`}
                    <ExternalIcon icon="linkExternal" />
                  </ExternalButton>
                </Link>
              </InnerStepContainer>
            )}
          </>
        );
      }

      const openWCModal = async () => {
        await connectExternalWallet(wallet, true, true);
      };

      const GetWalletButton = (
        <ExternalButton variant="secondary" onClick={isWalletConnect ? openWCModal : undefined}>
          {`${isWalletConnect ? 'Open' : 'Get'} ${wallet.name}`}
          <ExternalIcon icon="linkExternal" />
        </ExternalButton>
      );

      return (
        <>
          <InnerStepContainer>
            <CpslText weight="semiBold">Scan with your mobile device</CpslText>
            <QRContainer>
              {!qrUri ? <CpslSpinner size={100} /> : <CpslQrCode url={qrUri} imageSrc={wallet.iconUrl} />}
            </QRContainer>
            <CpslButton size="small" variant="ghost" onClick={handleCopy}>
              <CpslIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
              {isCopied ? 'Copied' : 'Copy Link'}
            </CpslButton>
          </InnerStepContainer>
          <InnerStepContainer>
            {isWalletConnect ? (
              <>{GetWalletButton}</>
            ) : (
              <Link href={wallet.downloadUrl ?? ''} target="_blank">
                {GetWalletButton}
              </Link>
            )}
          </InnerStepContainer>
        </>
      );
    }
  }, [wallet, walletDisplayHelpers, externalWalletError, qrUri]);

  useEffect(() => {
    if (!wallet) {
      setStep(ModalStep.AUTH_MAIN);
    }
  }, [wallet]);

  if (!wallet) {
    return null;
  }

  return <Container>{Content}</Container>;
};

const Container = styled(StepContainer)`
  flex: 1;
  justify-content: space-between;
`;

const Text = styled(CenteredText)`
  white-space: pre-line;
`;

const ExternalButton = styled(CpslButton)`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
  margin-top: 8px;
  text-decoration: none;
`;

const ExternalIcon = styled(CpslIcon)`
  --height: 20px;
  --width: 20px;
`;

const Link = styled.a`
  text-decoration: none;
`;
