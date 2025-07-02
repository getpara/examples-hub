import { safeStyled } from '@getpara/react-common';
import { StyledCpslTileButton } from '../common.js';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { useState } from 'react';
import { hasEmbeddedAuth } from '../../utils/authLayoutHelpers.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { type CommonWallet } from '@getpara/react-common';

const HAS_MORE_LENGTH = 3;

export const ExternalWallets = () => {
  const { wallets: allWallets, connectExternalWallet } = useExternalWallets();
  const setSelectedExternalWalletId = useModalStore(state => state.setSelectedExternalWalletId);
  const setStep = useModalStore(state => state.setStep);
  const showAll = useModalStore(state => state.step === ModalStep.EX_WALLET_MORE);
  const authLayout = useModalStore(state => state.authLayout);

  const [search, setSearch] = useState('');

  // Deduplicate wallets by ID and keep the first occurrence
  const dedupedWallets = Array.from(new Set(allWallets.map(wallet => wallet.id)))
    .map(id => {
      return allWallets.find(wallet => wallet.id === id) as CommonWallet;
    })
    .filter(wallet => wallet.internalId !== 'FARCASTER');

  const hasMore = dedupedWallets.length > HAS_MORE_LENGTH;
  const walletsToShow =
    showAll || !hasMore
      ? search
        ? dedupedWallets.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
        : dedupedWallets
      : dedupedWallets.slice(0, HAS_MORE_LENGTH);
  const showMoreButton = !showAll && hasMore;

  const handleShowAll = () => {
    setStep(ModalStep.EX_WALLET_MORE);
  };

  const handleParaClick = () => {
    setStep(ModalStep.AUTH_MORE);
  };

  const handleWalletClick = (wallet: CommonWallet) => () => {
    const shouldShowNetworkSelection = allWallets.filter(w => w.id === wallet.id).length > 1;

    if (shouldShowNetworkSelection) {
      setSelectedExternalWalletId(wallet.internalId);
      setStep(ModalStep.EX_WALLET_NETWORK_SELECT);
      return;
    }

    setSelectedExternalWalletId(wallet.internalId);
    setStep(ModalStep.EX_WALLET_SELECTED);

    if (wallet.installed) {
      connectExternalWallet(wallet);
    } else if (wallet.isMobile) {
      connectExternalWallet(wallet, true);
    }
  };

  return (
    <Container $maxHeight={showAll}>
      {showAll && (
        <>
          <SearchInputWrapper>
            <SearchInput
              placeholder="Search for your wallet"
              onCpslInput={async e => {
                setSearch(e.target.value ?? '');
              }}
              value={search}
              style={{ width: '100%' }}
            >
              <SearchIcon slot="start" icon="search" />
            </SearchInput>
          </SearchInputWrapper>
          {hasEmbeddedAuth(authLayout ?? []) && (
            <CpslButton fullWidth variant="tertiary" onClick={handleParaClick}>
              <WalletButtonOuterContainer>
                <WalletButtonInnerContainer>
                  <CpslIcon slot="start" icon="paraIcon" />
                  <CpslText weight="medium">Para</CpslText>
                </WalletButtonInnerContainer>
                <Badge $show $variant="installed">
                  <CpslText variant="body2XS" weight="medium">
                    Available
                  </CpslText>
                </Badge>
              </WalletButtonOuterContainer>
            </CpslButton>
          )}
        </>
      )}
      {walletsToShow.map(wallet =>
        showAll ? (
          <CpslButton key={wallet.id} fullWidth variant="tertiary" onClick={handleWalletClick(wallet)}>
            <WalletButtonOuterContainer>
              <WalletButtonInnerContainer>
                <CpslIcon slot="start" src={wallet.iconUrl} />
                <CpslText weight="medium">{wallet.name}</CpslText>
              </WalletButtonInnerContainer>
              <Badge $show={!!wallet.isMobile || !!wallet.installed} $variant={wallet.installed ? 'installed' : 'mobile'}>
                <CpslText variant="body2XS" weight="medium">
                  {wallet.installed ? 'Installed' : 'Mobile'}
                </CpslText>
              </Badge>
            </WalletButtonOuterContainer>
          </CpslButton>
        ) : (
          <WalletTileButton key={wallet.id} src={wallet.iconUrl} onClick={handleWalletClick(wallet)}>
            <TileButtonInnerContainer>
              {wallet.installed && <InstalledIndicator />}
              <CpslText variant="bodyXS" color="secondary" weight="medium">
                {wallet.name}
              </CpslText>
            </TileButtonInnerContainer>
          </WalletTileButton>
        ),
      )}
      {showMoreButton && (
        <CpslButton variant="tertiary" fullWidth onClick={handleShowAll}>
          <CpslIcon slot="start" icon="wallet" />
          More Wallets
        </CpslButton>
      )}
      {showAll && <BlurContainer />}
    </Container>
  );
};

const Container = safeStyled.div<{ $maxHeight: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;

  max-height: ${({ $maxHeight }) => ($maxHeight ? '348px' : 'none')};
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const WalletTileButton = safeStyled(StyledCpslTileButton)`
  flex: 1;
`;

const WalletButtonOuterContainer = safeStyled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

const WalletButtonInnerContainer = safeStyled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  cpsl-icon {
    --icon-color: var(--cpsl-color-contrast);
  }
  cpsl-text {
    &::part(text-element) {
      color: var(--cpsl-color-contrast);
    }
  }
`;

const Badge = safeStyled.div<{ $variant: 'installed' | 'mobile'; $show: boolean }>`
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid;
  border-color: ${({ $variant }) =>
    $variant === 'installed' ? 'var(--cpsl-color-utility-green)' : 'var(--cpsl-color-text-primary)'};
  cpsl-text {
    &::part(text-element) {
      color: ${({ $variant }) =>
        $variant === 'installed' ? 'var(--cpsl-color-utility-green)' : 'var(--cpsl-color-text-primary)'};
    }
  }
`;

const InstalledIndicator = safeStyled.span`
  width: 5px;
  height: 5px;
  border-radius: 100%;
  background-color: var(--cpsl-color-utility-green);
`;

const TileButtonInnerContainer = safeStyled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const SearchIcon = safeStyled(CpslIcon)`
  --icon-color: var(--cpsl-color-contrast);
`;

const SearchInputWrapper = safeStyled.div`
  width: 100%;
  background-color: var(--cpsl-color-background-0);

  position: sticky;
  top: 0;
  padding-bottom: 4px;
  margin-bottom: -4px;
`;

const SearchInput = safeStyled(CpslInput)`
  width: 100%;
  --container-background-color: var(--cpsl-color-background-8);
  --input-background-color: var(--cpsl-color-background-8);
`;

const BlurContainer = safeStyled.div`
  position: sticky;
  height: 56px;
  width: 100%;
  bottom: 0;

  background: linear-gradient(0deg, var(--cpsl-color-background-0) 0%, rgba(234, 239, 211, 0) 100%);
  pointer-events: none;
`;
