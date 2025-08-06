import { safeStyled } from '@getpara/react-common';
import { formatBalanceString } from '../../utils/stringFormatters.js';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { useMemo } from 'react';
import { truncateAddress } from '@getpara/web-sdk';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { getExternalWalletIcon } from '../../utils/icons.js';
import { useWalletBalance } from '../../../provider/index.js';

const Balance = () => {
  const { data: balance } = useWalletBalance();
  return (
    <CpslText variant="bodyM" weight="medium" style={{ visibility: !!balance ? 'visible' : 'hidden' }}>
      {balance ? formatBalanceString(balance) : '0'}
    </CpslText>
  );
};

export const AccountHeader = ({ withBalance = false }: { withBalance?: boolean } = {}) => {
  const para = useInternalClient();
  const { name, icon, src } = useMemo(() => {
    let name, icon, src;
    switch (true) {
      case Object.keys(para?.externalWallets).length > 0:
        {
          const wallet = Object.values(para.externalWallets)[0];
          name = wallet.ensName ?? truncateAddress(wallet.address!, wallet.type!, { prefix: para.cosmosPrefix });
          src = wallet.ensAvatar;
          icon = getExternalWalletIcon(wallet.externalProviderId);
        }
        break;
      default:
        name = `${para.partnerName} Wallet`;
        src = para.partnerLogo;
        icon = 'wallet02';
        break;
    }
    return { name, icon, src };
  }, [para.partnerName, para.partnerLogo, para.externalWallets]);

  return (
    <AccountContainer>
      <CpslIcon
        size="48px"
        inset="8px"
        border="1px solid var(--cpsl-color-background-8)"
        radius="theme"
        icon={icon}
        src={src}
      />
      <CpslText variant="headingXS" weight="semiBold" color="contrast">
        {name}
      </CpslText>
      {withBalance && <Balance />}
    </AccountContainer>
  );
};

const AccountContainer = safeStyled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;
