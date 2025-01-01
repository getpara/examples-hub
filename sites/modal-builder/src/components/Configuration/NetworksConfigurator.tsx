import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Network } from '@usecapsule/react-sdk';
import CosmosLogo from '../../assets/cosmos.svg';
import EthereumLogo from '../../assets/ethereum.svg';
import SolanaLogo from '../../assets/solana.svg';
import { AccordionContent, AccordionItem, AccordionTrigger, SwitchItem } from '../UI';
import { networksConfigAtom } from '../../atoms';
import { useAtom } from 'jotai';

const SECTION_LABEL = 'Networks';
const SECTION_SECONDARY_TEXT =
  'Choose the networks that your app supports. Network choices will affect the wallet and asset configuration options for your Capsule instance.';

const NETWORK_CONFIGS = [
  {
    network: Network.ETHEREUM,
    logo: EthereumLogo,
    label: 'Ethereum',
  },
  {
    network: Network.SOLANA,
    logo: SolanaLogo,
    label: 'Solana',
  },
  {
    network: Network.COSMOS,
    logo: CosmosLogo,
    label: 'Cosmos',
  },
];

interface NetworksConfiguratorProps {}

export const NetworksConfigurator: React.FC<NetworksConfiguratorProps> = () => {
  const [networksConfig, setNetworksConfig] = useAtom(networksConfigAtom);

  const handleToggleNetwork = useCallback(
    (network: Network, isChecked: boolean) => {
      const networkSet = new Set(networksConfig.networks);

      if (isChecked) {
        networkSet.add(network);
      } else {
        networkSet.delete(network);
      }
      setNetworksConfig({
        ...networksConfig,
        networks: Array.from(networkSet),
      });
    },
    [networksConfig],
  );

  return (
    <AccordionItem value="networks">
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
      <AccordionContent>
        <ContentWrapper>
          {NETWORK_CONFIGS.map(({ network, logo, label }) => (
            <SwitchItem
              key={network}
              logo={logo}
              label={label}
              isChecked={networksConfig.networks?.includes(network)!}
              onToggle={isChecked => handleToggleNetwork(network, isChecked)}
            />
          ))}
        </ContentWrapper>
      </AccordionContent>
    </AccordionItem>
  );
};

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
