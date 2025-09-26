import { getExternalWalletIcon, safeStyled } from '@getpara/react-common';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { useMemo } from 'react';
import { truncateAddress } from '@getpara/web-sdk';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useAssets } from '../../../provider/providers/AssetsProvider.js';
import { useAccount, useWallet } from '../../../provider/index.js';
import { WalletSelect } from '../WalletSelect/WalletSelect.js';

export const AccountHeader = ({ withBalance = false }: { withBalance?: boolean } = {}) => {
  const para = useInternalClient();
  const { connectionType } = useAccount();
  const { profileBalance, totalBalance } = useAssets();
  const { data: activeWallet } = useWallet();

  const { name, icon, src } = useMemo(() => {
    let name, icon, src;
    switch (true) {
      case activeWallet?.isExternal:
        name =
          activeWallet.ensName ?? truncateAddress(activeWallet.address!, activeWallet.type!, { prefix: para.cosmosPrefix });
        src = activeWallet.ensAvatar;
        icon = getExternalWalletIcon(activeWallet.externalProviderId);

        break;
      default:
        name = `${para.partnerName} Wallet`;
        src = para.partnerLogo;
        icon = 'wallet02';
        break;
    }
    return { name, icon, src };
  }, [para.partnerName, para.partnerLogo, activeWallet]);

  return (
    <AccountContainer>
      <CpslIcon
        size="48px"
        inset="8px"
        border="1px solid var(--cpsl-color-background-8)"
        color="var(--cpsl-color-foreground-0)"
        radius="theme"
        icon={icon}
        src={src}
      />
      {connectionType === 'both' ? (
        <WalletSelect />
      ) : (
        <CpslText variant="headingXS" weight="semiBold" color="contrast">
          {name}
        </CpslText>
      )}
      {withBalance && typeof totalBalance === 'string' && totalBalance !== '' && (
        <CpslText variant="bodyM" weight="medium" style={{ visibility: profileBalance ? 'visible' : 'hidden' }}>
          {totalBalance}
        </CpslText>
      )}
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
