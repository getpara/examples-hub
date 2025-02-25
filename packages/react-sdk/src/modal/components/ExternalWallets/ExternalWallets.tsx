import styled from 'styled-components';
import { StyledCpslTileButton } from '../common.js';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { useState } from 'react';
import type { CommonWallet } from '../../types/commonTypes.js';
import { hasEmbeddedAuth } from '../../utils/authLayoutHelpers.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';

const HAS_MORE_LENGTH = 3;

export const ExternalWallets = () => {
  const { wallets, connectExternalWallet } = useExternalWallets();
  const setSelectedExternalWalletId = useModalStore(state => state.setSelectedExternalWalletId);
  const setStep = useModalStore(state => state.setStep);
  const showAll = useModalStore(state => state.step === ModalStep.EX_WALLET_MORE);
  const authLayout = useModalStore(state => state.authLayout);

  const [search, setSearch] = useState('');

  const hasMore = wallets.length > HAS_MORE_LENGTH;
  const walletsToShow =
    showAll || !hasMore
      ? search
        ? wallets.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
        : wallets
      : wallets.slice(0, HAS_MORE_LENGTH);
  const showMoreButton = !showAll && hasMore;

  const handleShowAll = () => {
    setStep(ModalStep.EX_WALLET_MORE);
  };

  const handleParaClick = () => {
    setStep(ModalStep.AUTH_MORE);
  };

  const handleWalletClick = (wallet: CommonWallet) => () => {
    setSelectedExternalWalletId(wallet.id);
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

const Container = styled.div<{ $maxHeight: boolean }>`
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

const WalletTileButton = styled(StyledCpslTileButton)`
  flex: 1;
`;

const WalletButtonOuterContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

const WalletButtonInnerContainer = styled.div`
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

const Badge = styled.div<{ $variant: 'installed' | 'mobile'; $show: boolean }>`
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

const InstalledIndicator = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: var(--cpsl-color-utility-green);
`;

const TileButtonInnerContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const SearchIcon = styled(CpslIcon)`
  --icon-color: var(--cpsl-color-contrast);
`;

const SearchInputWrapper = styled.div`
  width: 100%;
  background-color: var(--cpsl-color-background-0);

  position: sticky;
  top: 0;
  padding-bottom: 4px;
  margin-bottom: -4px;
`;

const SearchInput = styled(CpslInput)`
  width: 100%;
  --container-background-color: var(--cpsl-color-background-8);
  --input-background-color: var(--cpsl-color-background-8);
`;

const BlurContainer = styled.div`
  position: sticky;
  height: 56px;
  width: 100%;
  bottom: 0;

  background: linear-gradient(0deg, var(--cpsl-color-background-0) 0%, rgba(234, 239, 211, 0) 100%);
  pointer-events: none;
`;
