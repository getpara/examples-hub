import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Sheet,
  Typography,
  Button,
} from '@getpara/react-component-library';
import { RemoveUserDialog } from './RemoveUserDialog';
import { useState } from 'react';
import { UsersTableData } from '../../../../../types/api';
import { LOGIN_METHOD_CONFIG } from '../../../../../utils/constants';
import { formatDatetime } from '../../../../../utils/formatDate';
import { Link } from 'react-router-dom';
import { GroupedCard, GroupedCards } from '../../../../../components/GroupedCards';
import { truncateAddress, TWalletType } from '@getpara/react-sdk';
import { WALLET_TYPE_CONFIG } from '../../ApiKeySetup/components/Networks';
import { CopyButton } from '../../../../../components/CopyButton';
import { blockExplorers } from '../../../../../utils/blockExplorers';
import { ExternalLink } from 'lucide-react';

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

  let walletAddresses: { address: string; type: TWalletType }[] = [];

  for (const wallet of user.walletAddresses ?? []) {
    if (!wallet) {
      continue;
    }

    const isEth = wallet.startsWith('0x');

    walletAddresses.push({ address: wallet, type: isEth ? 'EVM' : 'SOLANA' });

    // TODO: return more wallet data so the cosmos address can be derived if needed here
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
            {!!walletAddresses?.length && (
              <div className="para:flex para:flex-col para:gap-2">
                <Typography className="para:text-sm para:font-semibold">Wallets</Typography>
                <GroupedCards>
                  {walletAddresses.map(address => {
                    const Icon = WALLET_TYPE_CONFIG[address.type].Icon;

                    const blockExplorer = blockExplorers[address.type];

                    return (
                      <GroupedCard
                        key={address.address}
                        className="para:flex para:flex-row para:items-center para:gap-2 para:flex-wrap"
                      >
                        <div className="para:flex para:flex-row para:items-center para:gap-2">
                          <Icon className="para:size-4" />
                          <Typography className="para:text-sm para:font-medium" color="secondary">
                            {truncateAddress(address.address, address.type, { targetLength: 8 })}
                          </Typography>
                          <CopyButton value={address.address} className="para:size-4" />
                        </div>
                        {blockExplorer && (
                          <Link to={`${blockExplorer.url}${address.address}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="link" className="para:!px-2">
                              View on {blockExplorer.name}
                              <ExternalLink />
                            </Button>
                          </Link>
                        )}
                      </GroupedCard>
                    );
                  })}
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
