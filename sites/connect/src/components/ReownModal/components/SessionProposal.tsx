import { useSnapshot } from 'valtio';
import ModalStore from '../../../store/ModalStore';
import { Header } from './Header';
import { SignClientTypes } from '@walletconnect/types';
import { Footer } from './Footer';
import { useSelectedWallet } from '../../../hooks/useSelectedWallet';
import { Account } from './Account';
import { Permissions } from './Permissions';
import { Chains } from './Chains';
import { styledToast } from '../../../utils/HelperUtil';
import { walletKit } from '../../../utils/WalletConnectUtil';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { useMemo } from 'react';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '../../../data/EIP155Data';
import { COSMOS_MAINNET_CHAINS, COSMOS_SIGNING_METHODS } from '../../../data/COSMOSData';
import SettingsStore from '../../../store/SettingsStore';
import { useQueryClient } from '@tanstack/react-query';
import { ACTIVE_SESSIONS_BASE_QUERY_KEY } from '../../../hooks/useActiveSessions';

export const SessionProposal = () => {
  const { data } = useSnapshot(ModalStore.state);
  const { capsuleAddress, cosmosAddress } = useSnapshot(SettingsStore.state);
  const { wallet } = useSelectedWallet();
  const queryClient = useQueryClient();

  const proposal = data?.proposal as SignClientTypes.EventArguments['session_proposal'];

  const supportedNamespaces = useMemo(() => {
    // eip155
    const eip155Chains = Object.keys(EIP155_CHAINS);
    const eip155Methods = Object.values(EIP155_SIGNING_METHODS);
    // cosmos
    const cosmosChains = Object.keys(COSMOS_MAINNET_CHAINS);
    const cosmosMethods = Object.values(COSMOS_SIGNING_METHODS);

    return {
      eip155: {
        chains: eip155Chains,
        methods: eip155Methods,
        events: ['accountsChanged', 'chainChanged'],
        accounts: eip155Chains.map(chain => `${chain}:${capsuleAddress}`).flat(),
      },
      cosmos: {
        chains: cosmosChains,
        methods: cosmosMethods,
        events: [],
        accounts: cosmosChains.map(chain => `${chain}:${cosmosAddress}`).flat(),
      },
    };
  }, []);

  if (!proposal || !wallet) return null;

  const handleApprove = async () => {
    if (!proposal) return;

    const namespaces = buildApprovedNamespaces({
      proposal: proposal.params,
      supportedNamespaces,
    });

    try {
      await walletKit.approveSession({
        id: proposal.id,
        relayProtocol: proposal.params.relays[0].protocol,
        namespaces,
      });
      styledToast(`You can return to ${proposal.params.proposer.metadata.name}`, 'success');
    } catch (e) {
      styledToast((e as Error).message, 'error');
    } finally {
      queryClient.invalidateQueries({ queryKey: [ACTIVE_SESSIONS_BASE_QUERY_KEY], exact: false });
      ModalStore.close();
    }
  };

  const handleReject = async () => {
    if (!proposal) return;

    try {
      await walletKit.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      });
    } catch (e) {
      styledToast((e as Error).message, 'error');
    } finally {
      ModalStore.close();
    }
  };

  return (
    <>
      <Header metadata={proposal.params.proposer.metadata} intention="connect" verifyContext={proposal.verifyContext} />
      <Account />
      <Permissions />
      <Chains
        requiredNamespaces={proposal.params.requiredNamespaces ?? {}}
        optionalNamespaces={proposal.params.optionalNamespaces ?? {}}
      />
      <Footer onApprove={handleApprove} onReject={handleReject} />
    </>
  );
};
