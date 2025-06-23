import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Sheet,
  Typography,
} from '@getpara/react-component-library';
import { RemoveUserDialog } from './RemoveUserDialog';
import { useState } from 'react';
import { UsersTableData } from '../../../../../types/api';
import { LOGIN_METHOD_CONFIG } from '../../../../../utils/constants';
import { formatDatetime } from '../../../../../utils/formatDate';
import { GroupedCard, GroupedCards } from '../../../../../components/GroupedCards';
import { TWalletType } from '@getpara/react-sdk';
import { WalletInfoCard } from './WalletInfoCard';

type UserSheetProps = {
  isOpen: boolean;
  user?: UsersTableData;
  onClose: () => void;
};

export const UserSheet = ({ isOpen, user, onClose }: UserSheetProps) => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!user) {
    return null;
  }

  const externalWalletAddresses = user.externalWalletAddress ? [user.externalWalletAddress] : [];

  let wallets: { address: string; type: TWalletType }[] = [],
    externalWallets: { address: string; type: TWalletType }[] = [];

  const formatWallet = (address?: string): { address: string; type: TWalletType } | undefined => {
    if (!address) {
      return;
    }

    const isEth = address.startsWith('0x');
    const isSolana = !isEth && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

    return { address: address, type: isEth ? 'EVM' : isSolana ? 'SOLANA' : 'COSMOS' };
  };

  for (const address of user.walletAddresses ?? []) {
    const wallet = formatWallet(address);

    if (!wallet) {
      continue;
    }

    wallets.push(wallet);
  }

  for (const address of externalWalletAddresses) {
    const wallet = formatWallet(address);

    if (!wallet) {
      continue;
    }

    externalWallets.push(wallet);
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent>
          <SheetHeader className="para:pb-0">
            <SheetTitle className="para:break-words">
              {user.email ?? user.phoneNumber ?? user.farcasterUsername ?? user.userId ?? user.pregenIdentifier ?? ''}
            </SheetTitle>
            <SheetDescription className="para:break-words">{user.userId ?? user.pregenWalletId ?? ''}</SheetDescription>
          </SheetHeader>
          <div className="para:px-6 para:flex para:flex-col para:gap-4 para:overflow-auto">
            <GroupedCards>
              <GroupedCard>
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  Last Login Method
                </Typography>
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  {LOGIN_METHOD_CONFIG[user.lastMethod].label}
                </Typography>
              </GroupedCard>
              <GroupedCard>
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  Last Login
                </Typography>
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  {formatDatetime(user.lastSeen)}
                </Typography>
              </GroupedCard>
              <GroupedCard>
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  Created
                </Typography>
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  {formatDatetime(user.firstCreated)}
                </Typography>
              </GroupedCard>
            </GroupedCards>
            {!!wallets?.length && (
              <div className="para:flex para:flex-col para:gap-2">
                <Typography className="para:text-sm para:font-semibold">Wallets</Typography>
                <GroupedCards>
                  {wallets.map(wallet => (
                    <WalletInfoCard wallet={wallet} key={wallet.address} />
                  ))}
                </GroupedCards>
              </div>
            )}
            {!!externalWallets?.length && (
              <div className="para:flex para:flex-col para:gap-2">
                <Typography className="para:text-sm para:font-semibold">External Wallets</Typography>
                <GroupedCards>
                  {externalWallets.map(wallet => (
                    <WalletInfoCard wallet={wallet} key={wallet.address} />
                  ))}
                </GroupedCards>
              </div>
            )}
          </div>
          <SheetFooter>
            <div className="para:ml-auto">
              <RemoveUserDialog user={user} open={isRemoveDialogOpen} setOpen={setIsRemoveDialogOpen} onSuccess={onClose} />
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
