import { CommonWallet, safeStyled } from '@getpara/react-common';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { WALLET_TYPE_CONFIG } from '../../constants/walletTypeConfig.js';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';

type ExternalWalletNetworkSelectStepType = 'CONNECT' | 'ADD_EXTERNAL' | 'ACCOUNT_LINKING';

export const ExternalWalletNetworkSelectStep = ({ type = 'CONNECT' }: { type?: ExternalWalletNetworkSelectStepType }) => {
  const setStep = useModalStore(state => state.setStep);
  const selectedExternalWallet = useModalStore(state => state.selectedExternalWallet);
  const setSelectedExternalWallet = useModalStore(state => state.setSelectedExternalWallet);
  const { wallets, connectExternalWallet, addAdditionalExternalWallet } = useExternalWallets();
  const { accountLinkInProgress, linkAccount } = useAccountLinking();

  const externalWalletProvider =
    accountLinkInProgress?.pendingWalletProvider ??
    accountLinkInProgress?.externalWallet?.providerId ??
    selectedExternalWallet?.id;

  if (!externalWalletProvider) {
    return null;
  }

  const availableWallets = wallets.filter(w => w.id === externalWalletProvider);

  const firstWallet = availableWallets[0];

  const handleWalletClick = (wallet: CommonWallet) => async () => {
    switch (type) {
      case 'ACCOUNT_LINKING':
        // For account linking, use the linkAccount function
        linkAccount({ externalWallet: { provider: wallet.id, type: wallet.type } });
        break;

      case 'ADD_EXTERNAL':
        // For adding external wallets, use addAdditionalExternalWallet directly
        setSelectedExternalWallet({ id: wallet.id, type: wallet.type });
        setStep(ModalStep.ADD_EX_WALLET_SELECTED);
        try {
          await addAdditionalExternalWallet(wallet);
        } catch (error) {
          console.error('Failed to add additional wallet:', error);
        }
        break;

      case 'CONNECT':
      default:
        // For initial connection, use connectExternalWallet
        setSelectedExternalWallet({ id: wallet.id, type: wallet.type });
        setStep(ModalStep.EX_WALLET_SELECTED);
        if (wallet.installed || wallet.internalId === 'FARCASTER') {
          connectExternalWallet({ wallet });
        } else if (wallet.isMobile) {
          connectExternalWallet({ wallet, isMobile: true });
        }
        break;
    }
  };

  // Determine the icon source based on the type
  const getIconSource = () => {
    switch (type) {
      case 'ACCOUNT_LINKING':
        // For account linking, use the account link in progress wallet icon
        return accountLinkInProgress?.externalWallet?.providerId
          ? wallets.find(w => w.id === accountLinkInProgress.externalWallet?.providerId)?.iconUrl
          : firstWallet?.iconUrl;
      case 'ADD_EXTERNAL':
        // For adding external wallets, use the selected wallet icon
        return selectedExternalWallet?.id
          ? wallets.find(w => w.id === selectedExternalWallet.id)?.iconUrl
          : firstWallet?.iconUrl;
      case 'CONNECT':
      default:
        // For initial connection, use the first available wallet icon
        return firstWallet?.iconUrl;
    }
  };

  return (
    <Container>
      <Avatar slot="image" src={getIconSource()} />
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
