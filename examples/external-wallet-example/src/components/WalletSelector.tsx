import { CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import { useAccount, useWallet, useWalletState } from '@getpara/react-sdk';
import styled from 'styled-components';

export const WalletSelector = () => {
  const { embedded } = useAccount();
  const { data: activeWallet } = useWallet();
  const { setSelectedWallet } = useWalletState();

  // Filter to only embedded wallets (not external)
  const embeddedWallets = embedded?.wallets?.filter(wallet => !wallet.isExternal) || [];

  // Create unique entries based on wallet ID + type combination
  const uniqueWallets = embeddedWallets.reduce(
    (acc, wallet) => {
      const key = `${wallet.id}-${wallet.type}`;
      if (!acc.find(w => `${w.id}-${w.type}` === key)) {
        acc.push(wallet);
      }
      return acc;
    },
    [] as typeof embeddedWallets,
  );

  if (uniqueWallets.length <= 1) {
    return null; // Don't show selector if there's only one or no embedded wallets
  }

  const getWalletKey = (wallet: (typeof uniqueWallets)[0]) => {
    return `${wallet.id}-${wallet.type}`;
  };

  const handleWalletChange = (walletKey: string) => {
    const wallet = uniqueWallets.find(w => getWalletKey(w) === walletKey);
    if (wallet) {
      // Try setting without type first, then with type
      setSelectedWallet({ id: wallet.id, type: wallet.type });
    }
  };

  const getWalletDisplayName = (wallet: (typeof uniqueWallets)[0]) => {
    const typeLabel = wallet.type ? `${wallet.type} ` : '';
    const addressLabel = wallet.address ? `(${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)})` : '';
    return `${typeLabel}${addressLabel}`;
  };

  return (
    <Container>
      <CpslText variant="bodyS" weight="medium">
        Active Wallet:
      </CpslText>
      <SelectContainer>
        <CpslSelect
          selectedValue={activeWallet ? getWalletKey(activeWallet) : ''}
          onCpslSelectValueChange={(e: CustomEvent<string>) => handleWalletChange(e.detail)}
          placeholder="Select Wallet"
          formatValue={(walletKey: string) => {
            const wallet = uniqueWallets.find(w => getWalletKey(w) === walletKey);
            return wallet ? getWalletDisplayName(wallet) : walletKey;
          }}
        >
          {uniqueWallets.map(wallet => (
            <CpslSelectItem key={getWalletKey(wallet)} slot="items" value={getWalletKey(wallet)}>
              <CpslText>{getWalletDisplayName(wallet)}</CpslText>
            </CpslSelectItem>
          ))}
        </CpslSelect>
      </SelectContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const SelectContainer = styled.div`
  width: 100%;
`;
