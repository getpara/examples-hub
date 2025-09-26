import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { CenteredText, HeroAccountTypeIcon, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModalStore } from '../../stores/index.js';
import { CommonWallet, HeroSpinner, safeStyled } from '@getpara/react-common';
import { useCopyToClipboard } from '@getpara/react-common';
import { ModalStep } from '../../utils/steps.js';
import { isMobile, isTablet } from '@getpara/web-sdk';
import { routeMobileExternalWallet } from '../../utils/routeMobileExternalWallet.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../provider/stores/useStore.js';

export const ExternalWalletMobileConnect = ({
  wallet,
  qrUri: propsQrUri,
  onConnectWc,
  isSelfFetching = false,
}: {
  wallet: CommonWallet;
  qrUri?: string;
  onConnectWc: (_: CommonWallet) => Promise<void>;
  isSelfFetching?: boolean;
}) => {
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const [isCopied, copy] = useCopyToClipboard();
  const appName = useStore(state => state.appName);
  const [qrUri, setQrUri] = useState<string | undefined>(isSelfFetching ? undefined : propsQrUri);
  const isWalletConnect = wallet.id === 'WalletConnect';

  const handleCopy = () => {
    if (qrUri) {
      copy(qrUri);
    }
  };

  useEffect(() => {
    const fetchQrUri = () => {
      if (!isSelfFetching) {
        return;
      }

      wallet.getQrUri?.().then(setQrUri).catch();
    };

    fetchQrUri();
  }, [wallet, isSelfFetching]);

  useEffect(() => {
    setQrUri(propsQrUri);
  }, [propsQrUri]);

  const isError = !!externalWalletError?.[0];
  if (wallet.type === 'SOLANA' || (isMobile() && !isTablet())) {
    return (
      <>
        {wallet.type === 'SOLANA' && qrUri && (
          <InnerStepContainer>
            <HeroSpinner
              icon={<HeroAccountTypeIcon accountType={wallet.internalId} src={wallet ? wallet.iconUrl : undefined} />}
              status={isError ? 'error' : 'pending'}
              text={isError ? externalWalletError[0] : `Continue in the ${wallet.name} mobile app.`}
              secondaryText={externalWalletError?.[1]}
            />
          </InnerStepContainer>
        )}
        {wallet.id !== 'WalletConnect' && (
          <InnerStepContainer>
            <HeroSpinner
              icon={<HeroAccountTypeIcon accountType={wallet.internalId} src={wallet ? wallet.iconUrl : undefined} />}
              status={isError ? 'error' : 'pending'}
              text={isError ? externalWalletError[0] : `Confirm connection request in the ${wallet.name} app.`}
              secondaryText={externalWalletError?.[1]}
            />
            {(wallet.type === 'SOLANA' && qrUri && !wallet.hasIosSafariExtension) || wallet.type !== 'SOLANA' ? (
              <CpslButton onClick={() => routeMobileExternalWallet(qrUri)} fullWidth>
                Connect Wallet
              </CpslButton>
            ) : (
              <Text weight="semiBold">
                {wallet.hasIosSafariExtension
                  ? `Please install and use the ${wallet.name} extension for iOS Safari.`
                  : `Please navigate to ${appName} in the ${wallet.name} wallet.`}
              </Text>
            )}
            {!wallet.hasIosSafariExtension && (
              <Link href={wallet.downloadUrl ?? ''} target="_blank">
                <ExternalButton variant="secondary">
                  {`Get ${wallet.name}`}
                  <ExternalIcon icon="linkExternal" />
                </ExternalButton>
              </Link>
            )}
          </InnerStepContainer>
        )}
      </>
    );
  }

  const GetWalletButton = (
    <ExternalButton variant="secondary" onClick={isWalletConnect ? () => onConnectWc(wallet) : undefined}>
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
};

export const ExternalWalletStep = ({ isAddingWallets = false }: { isAddingWallets?: boolean }) => {
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const step = useModalStore(state => state.step);
  const setStep = useModalStore(state => state.setStep);
  const { connectExternalWallet, addAdditionalExternalWallet, wallet, qrUri, walletDisplayHelpers } = useExternalWallets();

  const handleConnect = useCallback(
    async (wallet: CommonWallet, isWc = false) => {
      if (isAddingWallets) {
        await addAdditionalExternalWallet(wallet);
      } else {
        await (isWc ? connectExternalWallet(wallet, true, true) : connectExternalWallet(wallet));
      }
    },
    [isAddingWallets, addAdditionalExternalWallet, connectExternalWallet],
  );

  useEffect(() => {
    routeMobileExternalWallet(qrUri);
  }, [qrUri]);

  const handleTryAgainClick = async () => {
    if (wallet) {
      await handleConnect(wallet);
    }
  };

  const Content = useMemo(() => {
    if (!wallet) {
      return null;
    }

    const isWalletConnect = wallet.id === 'WalletConnect';
    const isMobileWalletConnect = isMobile() && isWalletConnect;

    if (isMobileWalletConnect) {
      <InnerStepContainer>
        <Text weight="semiBold">Continue in the WalletConnect modal.</Text>
      </InnerStepContainer>;
    }

    const { showExtension, showMobile } = walletDisplayHelpers;

    // Fallback to not supported text
    if (!showMobile && !showExtension) {
      return (
        <InnerStepContainer>
          <Text weight="semiBold">{`${wallet.name} isn't supported on mobile devices.\n\nPlease choose another wallet or continue on desktop.`}</Text>
        </InnerStepContainer>
      );
    }

    if (showExtension) {
      const isInstalled = wallet.installed;
      const isError = !isInstalled || externalWalletError?.length;
      return (
        <InnerStepContainer>
          <HeroSpinner
            icon={<HeroAccountTypeIcon accountType={wallet.internalId} src={wallet ? wallet.iconUrl : undefined} />}
            status={isError ? 'error' : 'pending'}
            text={
              isError
                ? isInstalled
                  ? externalWalletError?.[0]
                  : `${wallet.name} not detected`
                : `Confirm connection request in the ${wallet.name} browser extension.`
            }
          />
          {isError && (
            <CpslButton
              as={isInstalled ? 'button' : 'a'}
              href={wallet.downloadUrl ?? ''}
              target="_blank"
              variant="secondary"
              onClick={handleTryAgainClick}
            >
              <CpslIcon fullWidth slot="start" icon={isInstalled ? 'refresh' : 'linkExternal'} />
              {isInstalled ? 'Try Again' : `Get ${wallet.name}`}
            </CpslButton>
          )}
        </InnerStepContainer>
      );
    }
    if (showMobile) {
      return (
        <ExternalWalletMobileConnect
          wallet={wallet}
          qrUri={qrUri}
          onConnectWc={async (w: CommonWallet) => {
            await handleConnect(w, true);
          }}
        />
      );
    }
  }, [
    wallet,
    walletDisplayHelpers,
    externalWalletError,
    qrUri,
    isAddingWallets,
    addAdditionalExternalWallet,
    connectExternalWallet,
  ]);

  useEffect(() => {
    if (!wallet) {
      if (step === ModalStep.ADD_EX_WALLET_SELECTED) {
        setStep(ModalStep.ADD_EX_WALLET_MORE);
      } else {
        setStep(ModalStep.AUTH_MAIN);
      }
    }
  }, [wallet, step]);

  if (!wallet) {
    return null;
  }

  return <Container>{Content}</Container>;
};

const Container = safeStyled(StepContainer)`
  flex: 1;
  justify-content: space-between;
`;

const Text = safeStyled(CenteredText)`
  white-space: pre-line;
`;

const ExternalButton = safeStyled(CpslButton)`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
  margin-top: 8px;
  text-decoration: none;
`;

const ExternalIcon = safeStyled(CpslIcon)`
  --height: 20px;
  --width: 20px;
`;

const Link = safeStyled.a`
  text-decoration: none;
`;
