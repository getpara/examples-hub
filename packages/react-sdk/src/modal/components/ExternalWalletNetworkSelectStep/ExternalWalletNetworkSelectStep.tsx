import { CommonWallet, safeStyled } from '@getpara/react-common';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { WALLET_TYPE_CONFIG } from '../../constants/walletTypeConfig.js';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';

export const ExternalWalletNetworkSelectStep = () => {
  const setStep = useModalStore(state => state.setStep);
  const selectedExternalWalletId = useModalStore(state => state.selectedExternalWalletId);
  const setSelectedExternalWalletId = useModalStore(state => state.setSelectedExternalWalletId);
  const { wallets, connectExternalWallet } = useExternalWallets();
  const { accountLinkInProgress, linkAccount } = useAccountLinking();

  const externalWalletProvider =
    accountLinkInProgress?.pendingWalletProvider ?? accountLinkInProgress?.externalWallet?.providerId;

  if (!accountLinkInProgress && !selectedExternalWalletId) {
    setStep(ModalStep.ACCOUNT_MAIN);
    return null;
  }

  const availableWallets = wallets.filter(w => w.internalId === (externalWalletProvider ?? selectedExternalWalletId));

  const firstWallet = availableWallets[0];

  const handleWalletClick = (wallet: CommonWallet) => () => {
    if (accountLinkInProgress) {
      linkAccount({ externalWallet: wallet });
      return;
    }

    setSelectedExternalWalletId(wallet.internalId);
    setStep(ModalStep.EX_WALLET_SELECTED);

    if (wallet.installed || wallet.internalId === 'FARCASTER') {
      connectExternalWallet(wallet);
    } else if (wallet.isMobile) {
      connectExternalWallet(wallet, true);
    }
  };

  return (
    <Container>
      <Avatar slot="image" src={firstWallet?.iconUrl} />
      <ButtonContainer>
        {availableWallets.map(wallet => {
          const config = WALLET_TYPE_CONFIG[wallet.type];

          return (
            <CpslButton key={wallet.type} fullWidth variant="tertiary" onClick={handleWalletClick(wallet)}>
              <ButtonInnerContainer>
                <CpslIcon slot="start" icon={config.icon} />
                <CpslText weight="medium">{config.name}</CpslText>
              </ButtonInnerContainer>
            </CpslButton>
          );
        })}
      </ButtonContainer>
    </Container>
  );
};

const Container = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

const ButtonContainer = safeStyled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Avatar = safeStyled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

const ButtonInnerContainer = safeStyled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;
