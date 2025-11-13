import { useSelectedWallet } from '../../../hooks/useSelectedWallet';
import { Typography } from '@getpara/react-component-library';
import { truncateAddress } from '@getpara/react-sdk';
import { Avatar } from '../../Avatar';

export const WalletInfo = () => {
  const { wallet } = useSelectedWallet();

  if (!wallet) return null;

  const walletPartner = wallet?.partner;
  const walletName = wallet.name || `${walletPartner?.name || walletPartner?.displayName || 'Para'} Wallet`;
  const walletImage = walletPartner?.iconUrl || '';
  const walletAddress = wallet?.address || '';

  return (
    <div className="para:flex para:gap-2 para:items-center">
      <Avatar src={walletImage} alt={walletName} className="para:size-12" />
      <div className="para:flex para:flex-col para:gap-1 para:justify-center">
        <Typography className="para:text-lg para:font-semibold para:leading-none">{walletName}</Typography>
        <Typography className="para:text-sm para:font-medium para:leading-none" color="muted">
          {truncateAddress(walletAddress, wallet.type ?? 'EVM')}
        </Typography>
      </div>
    </div>
  );
};
