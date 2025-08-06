import { CpslQrCode, CpslSpinner } from '@getpara/react-components';
import { CenteredText, InnerStepContainer, QRContainer } from '../common.js';
import { isMobile } from '@getpara/web-sdk';
import { useModalStore } from '../../stores/index.js';
import { useMemo } from 'react';
import { useWallet } from '../../../provider/hooks/index.js';
import { useAddFunds } from './AddFundsContext.js';
import { formatNetworkList } from '../../utils/stringFormatters.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

const GENERIC_WALLET = {
  EVM: 'Ethereum or EVM-based networks',
  SOLANA: 'Solana or SVM-based networks',
  COSMOS: 'Cosmos networks',
};

export function AddFundsReceive() {
  const { networks } = useAddFunds();
  const para = useInternalClient();
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const { data: activeWallet } = useWallet();

  const address = useMemo(
    () => (activeWallet ? para.getDisplayAddress(activeWallet.id, { addressType: activeWallet.type }) : ''),
    [para, activeWallet?.id, activeWallet?.type],
  );

  return (
    <>
      {!isMobile() && (
        <>
          <InnerStepContainer>
            <QRContainer>{!address ? <CpslSpinner size={100} /> : <CpslQrCode key={address} url={address} />}</QRContainer>
          </InnerStepContainer>
        </>
      )}
      {activeWallet?.type && (
        <InnerStepContainer>
          <CenteredText variant="bodyS" weight="semiBold">
            Only send funds on{' '}
            {!!onRampConfig?.allowedAssets && networks.length > 0
              ? formatNetworkList(networks)
              : GENERIC_WALLET[activeWallet.type]}
          </CenteredText>
        </InnerStepContainer>
      )}
    </>
  );
}
