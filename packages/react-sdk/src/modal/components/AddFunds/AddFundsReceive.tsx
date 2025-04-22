import {
  CpslButton,
  CpslDivider,
  CpslIcon,
  CpslIdenticon,
  CpslQrCode,
  CpslSpinner,
  CpslText,
} from '@getpara/react-components';
import { CenteredText, FilledDisabledInput, InnerStepContainer, QRContainer } from '../common.js';
import { isMobile } from '@getpara/web-sdk';
import { useModalStore } from '../../stores/index.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useCopyToClipboard } from '@getpara/react-common';
import { useMemo } from 'react';
import { useWallet } from '../../../provider/hooks/index.js';
import { useAddFunds } from './AddFundsContext.js';
import { formatNetworkList } from '../../utils/stringFormatters.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

const GENERIC_WALLET = {
  EVM: 'Ethereum or EVM-based L2s',
  SOLANA: 'Solana',
  COSMOS: 'Cosmos',
};

export function AddFundsReceive() {
  const [isCopied, copy] = useCopyToClipboard();
  const { networks } = useAddFunds();
  const para = useInternalClient();
  const appName = useStore(state => state.appName);
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const { data: activeWallet } = useWallet();

  const address = useMemo(
    () => (activeWallet ? para.getDisplayAddress(activeWallet.id, { addressType: activeWallet.type }) : ''),
    [para, activeWallet?.id, activeWallet?.type],
  );

  const onCopy = () => {
    copy(address);
  };

  return (
    <>
      {activeWallet && (
        <InnerStepContainer>
          <FilledDisabledInput
            noAutoDisable
            key={address}
            readonly
            placeholder={para.getDisplayAddress(activeWallet.id, {
              truncate: true,
              addressType: activeWallet.type,
              targetLength: 16,
            })}
          >
            <CpslIdenticon slot="start" size="32px" hash={para.getIdenticonHash(activeWallet.id, activeWallet.type)} />
            <CpslButton slot="end" variant="ghost" onClick={onCopy}>
              <CpslIcon icon={isCopied ? 'check' : 'copy'} />
            </CpslButton>
          </FilledDisabledInput>
        </InnerStepContainer>
      )}
      {!isMobile() && (
        <>
          <CpslDivider>or</CpslDivider>
          <InnerStepContainer>
            <QRContainer>{!address ? <CpslSpinner size={100} /> : <CpslQrCode key={address} url={address} />}</QRContainer>
            <CpslText weight="semiBold" color="secondary">
              Scan with your crypto wallet
            </CpslText>
          </InnerStepContainer>
        </>
      )}
      {activeWallet?.type && (
        <InnerStepContainer>
          <CenteredText weight="semiBold">
            {(!!onRampConfig?.allowedAssets && networks.length > 0) || hideWallets ? (appName ?? 'This App') : 'This Wallet'}{' '}
            Only Supports:
          </CenteredText>
          <CenteredText weight="medium" color="secondary">
            {!!onRampConfig?.allowedAssets && networks.length > 0
              ? formatNetworkList(networks)
              : GENERIC_WALLET[activeWallet.type]}
          </CenteredText>
        </InnerStepContainer>
      )}
    </>
  );
}
