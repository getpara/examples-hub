import { Typography, Button } from '@getpara/react-component-library';
import { Link } from 'react-router-dom';
import { GroupedCard } from '../../../../../components/GroupedCards';
import { truncateAddress, TWalletType } from '@getpara/react-sdk';
import { WALLET_TYPE_CONFIG } from '../../ApiKeySetup/components/Networks';
import { CopyButton } from '../../../../../components/CopyButton';
import { blockExplorers } from '../../../../../utils/blockExplorers';
import { ExternalLink } from 'lucide-react';

type WalletInfoCardProps = {
  wallet: { address: string; type: TWalletType };
};

export const WalletInfoCard = ({ wallet: { address, type } }: WalletInfoCardProps) => {
  const Icon = WALLET_TYPE_CONFIG[type].Icon;

  const blockExplorer = blockExplorers[type];

  return (
    <GroupedCard key={address} className="para:flex para:flex-row para:items-center para:gap-0 para:flex-wrap">
      <div className="para:flex para:flex-row para:items-center para:gap-2">
        <Icon className="para:size-4" />
        <Typography className="para:text-sm para:font-medium" color="secondary">
          {truncateAddress(address, type, { targetLength: 8 })}
        </Typography>
        <CopyButton value={address} className="para:size-4" />
      </div>
      {blockExplorer && (
        <Link to={`${blockExplorer.url}${address}`} target="_blank" rel="noopener noreferrer">
          <Button variant="link" className="para:!px-2">
            View on {blockExplorer.name}
            <ExternalLink />
          </Button>
        </Link>
      )}
    </GroupedCard>
  );
};
