import React, { useEffect, useState } from 'react';
import { Flex } from 'rebass';
import LogoutIcon from '@mui/icons-material/Logout';

import * as Styled from './styles';
import { useUserStore } from '@/store/useUserStore';
import { InputAdornment, MenuItem } from '@mui/material';
import { useClient, Wallet } from '@getpara/react-sdk';
import { StyledSelect } from '../base/Select';
import { AddressText, Copybutton } from '../base/Input/styles';
import toast from 'react-hot-toast';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import Input from '../base/Input';

interface MyWalletProps {
  logout: () => void;
}

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

const MyWallet = ({ logout }: MyWalletProps) => {
  const para = useClient();
  const updateUserState = useUserStore(state => state.updateState);

  const { wallet } = useSelectedWallet();
  const [wallets, setWallets] = useState<Pick<Wallet, 'id' | 'address'>[]>([]);

  const address = wallet?.address ?? '';

  const handleCopy = () => {
    toast.success('Address Copied!');
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet?.address);
    }
  };

  useEffect(() => {
    const loadWallets = async () => {
      if (!para) return;

      if (await para.isFullyLoggedIn()) {
        const _wallets = Object.values(para.wallets)
          .map(wallet => ({ address: wallet.address, id: wallet.id }))
          .filter(w => !!w.address);
        setWallets(_wallets);
      }
    };

    loadWallets();
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <Flex mb="10px" alignItems="center" justifyContent="space-between">
        <Styled.LabelText>My Wallet:</Styled.LabelText>
        <Styled.ViewButton
          onClick={() => {
            const url =
              wallet?.type === 'SOLANA'
                ? `https://solscan.io/account/${address}`
                : `https://blockscan.com/address/${address}`;
            window.open(url, '_blank');
          }}
        >
          View on {wallet?.type === 'SOLANA' ? 'Solscan' : 'Etherscan'}
        </Styled.ViewButton>
      </Flex>
      <Flex alignItems="center">
        {!!wallets?.length ? (
          <StyledSelect
            onChange={e => {
              updateUserState({ currentWalletId: e.target.value });
            }}
            value={wallet?.id ?? ''}
            endAdornment={
              <InputAdornment position="end" sx={{ pr: '24px' }}>
                <Copybutton data-testid="copy-button" onClick={handleCopy}>
                  <ContentCopyIcon />
                </Copybutton>
              </InputAdornment>
            }
            disabled={wallets.length < 2}
          >
            {wallets.map(wallet => (
              <MenuItem value={wallet.id} key={wallet.id}>
                <AddressText>{formatAddress(wallet.address ?? '')}</AddressText>
              </MenuItem>
            ))}
          </StyledSelect>
        ) : (
          <Input fullAddress={address} walletAddress={formatAddress(address)} disabled />
        )}
        <Styled.LogoutButton onClick={logout}>
          <LogoutIcon />
        </Styled.LogoutButton>
      </Flex>
    </div>
  );
};

export default MyWallet;
