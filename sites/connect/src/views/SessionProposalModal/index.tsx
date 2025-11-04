import { Col, Row, Text } from '@nextui-org/react';
import { useCallback, useMemo } from 'react';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { Flex } from 'rebass';

import ModalStore from '@/store/ModalStore';
import { styledToast } from '@/utils/HelperUtil';
import { web3wallet } from '@/utils/WalletConnectUtil';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/data/EIP155Data';
import ChainDataMini from '@/components/ChainDataMini';
import ChainAddressMini from '@/components/ChainAddressMini';
import { getChainData } from '@/data/chainsUtil';
import RequestModal from '../RequestModal';
import { useSnapshot } from 'valtio';
import SettingsStore from '@/store/SettingsStore';
import { COSMOS_MAINNET_CHAINS, COSMOS_SIGNING_METHODS } from '@/data/COSMOSData';

import * as Styled from './styles';

export default function SessionProposalModal() {
  // Get proposal data and wallet address from store
  const proposal = ModalStore.state.data?.proposal;
  const { capsuleAddress, cosmosAddress } = useSnapshot(SettingsStore.state);
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

  const requestedChains = useMemo(() => {
    if (!proposal) return [];
    const required = [];
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }

    const optional = [];
    for (const [key, values] of Object.entries(proposal.params.optionalNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      optional.push(chains);
    }
    return [...new Set([...required.flat(), ...optional.flat()])];
  }, [proposal]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(() => requestedChains.map(chain => getChainData(chain!)), [requestedChains]);

  const getAddress = useCallback((namespace?: string) => {
    if (!namespace) return capsuleAddress;
    switch (namespace) {
      case 'eip155':
        return capsuleAddress;
      case 'cosmos':
        return cosmosAddress;
    }
  }, []);

  // Ensure proposal is defined
  if (!proposal) {
    return <Text>Missing proposal data</Text>;
  }

  // Get required proposal data
  const { id, params } = proposal;

  const { relays } = params;

  // Hanlde approve action, construct session namespace
  async function onApprove() {
    if (proposal) {
      const namespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces,
      });

      try {
        await web3wallet.approveSession({
          id,
          relayProtocol: relays[0].protocol,
          namespaces,
        });
      } catch (e) {
        styledToast((e as Error).message, 'error');
        return;
      }
    }
    ModalStore.close();
  }

  // Hanlde reject action
  async function onReject() {
    if (proposal) {
      try {
        await web3wallet.rejectSession({
          id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        });
      } catch (e) {
        styledToast((e as Error).message, 'error');
        return;
      }
    }
    ModalStore.close();
  }

  return (
    <RequestModal
      metadata={proposal.params.proposer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      disabledApprove={
        !requestedChains.some(ch => {
          if (!ch) return false;
          const [namespace] = ch.toString().split(':');
          return namespace.startsWith('eip155') || namespace.startsWith('cosmos');
        })
      }
    >
      <Styled.LabelText>Account:</Styled.LabelText>
      <Row>
        <ChainAddressMini address={getAddress()} />
      </Row>
      <div style={{ marginBottom: '12px' }} />
      <Row>
        <Col>
          <Styled.LabelText>Requested permissions:</Styled.LabelText>
        </Col>
      </Row>
      <Row>
        <Flex mb="5px" alignItems="center">
          <Styled.CheckIcon />
          <Styled.ListItemText>View your balance and activity</Styled.ListItemText>
        </Flex>
      </Row>
      <Row>
        <Flex mb="5px" alignItems="center">
          <Styled.CheckIcon />
          <Styled.ListItemText>Send approval requests</Styled.ListItemText>
        </Flex>
      </Row>
      <Row>
        <Flex alignItems="center">
          <Styled.CloseIcon style={{ verticalAlign: 'bottom' }} />
          <Styled.ListItemText>Move funds without permission</Styled.ListItemText>
        </Flex>
      </Row>
      <div style={{ marginBottom: '12px' }} />
      <Styled.LabelText>Chains:</Styled.LabelText>
      {!!supportedChains.length &&
        supportedChains.map((chain, i) => {
          if (!chain) {
            return <></>;
          }

          return (
            <Row key={i}>
              <ChainDataMini key={i} chainId={`${chain?.namespace}:${chain?.chainId}`} />
            </Row>
          );
        })}
    </RequestModal>
  );
}
