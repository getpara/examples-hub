import React from 'react';
import styled from 'styled-components';
import { Network } from '@usecapsule/react-sdk';
import CosmosLogo from '../../assets/cosmos.svg';
import EthereumLogo from '../../assets/ethereum.svg';
import SolanaLogo from '../../assets/solana.svg';
import { AccordionContent, AccordionItem, AccordionTrigger, SwitchItem } from '../UI';
import { networksConfigAtom } from '../../atoms';
import { useAtom } from 'jotai';

interface NetworksConfiguratorProps {}

export const NetworksConfigurator: React.FC<NetworksConfiguratorProps> = () => {
  const [networksConfig, setNetworksConfig] = useAtom(networksConfigAtom);

  const handleToggleNetwork = (network: Network, isChecked: boolean) => {
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
  };

  return (
    <AccordionItem value="networks">
      <AccordionTrigger
        label="Networks"
        secondaryText="Choose the networks that your app supports. Network choices will affect the wallet and asset configuration options for your Capsule instance."
      />
      <AccordionContent>
        <ContentWrapper>
          <SwitchItem
            logo={EthereumLogo}
            label="Ethereum"
            isChecked={networksConfig.networks?.includes(Network.ETHEREUM)!}
            onToggle={isChecked => handleToggleNetwork(Network.ETHEREUM, isChecked)}
          />
          <SwitchItem
            logo={SolanaLogo}
            label="Solana"
            isChecked={networksConfig.networks?.includes(Network.SOLANA)!}
            onToggle={isChecked => handleToggleNetwork(Network.SOLANA, isChecked)}
          />
          <SwitchItem
            logo={CosmosLogo}
            label="Cosmos"
            isChecked={networksConfig.networks?.includes(Network.COSMOS)!}
            onToggle={isChecked => handleToggleNetwork(Network.COSMOS, isChecked)}
          />
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
