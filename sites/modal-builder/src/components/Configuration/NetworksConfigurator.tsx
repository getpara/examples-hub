import React, { useCallback } from 'react';
import styled from 'styled-components';
import { CosmosWallet, EvmWallet, Network, SolanaWallet } from '@usecapsule/react-sdk';
import CosmosLogo from '../../assets/cosmos.svg';
import EthereumLogo from '../../assets/ethereum.svg';
import SolanaLogo from '../../assets/solana.svg';
import { AccordionContent, AccordionItem, AccordionTrigger, SwitchItem } from '../UI';
import { authenticationConfigAtom, networksConfigAtom } from '../../atoms';
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
  const [authConfig, setAuthConfig] = useAtom(authenticationConfigAtom);

  const handleToggleNetwork = useCallback(
    (network: Network, isChecked: boolean) => {
      const networkSet = new Set(networksConfig.networks);

      if (isChecked) {
        networkSet.add(network);
      } else {
        networkSet.delete(network);
      }
      const updatedNetworksConfig = {
        ...networksConfig,
        networks: Array.from(networkSet),
      };
      setNetworksConfig(updatedNetworksConfig);

      if (!isChecked) {
        const filteredWallets = (authConfig.externalWallets ?? []).filter(wallet => !walletIsForNetwork(wallet, network));
        setAuthConfig({
          ...authConfig,
          externalWallets: filteredWallets,
        });
      }

      if (networkSet.size === 0 && authConfig.isWeb3AuthEnabled) {
        setAuthConfig({
          ...authConfig,
          isWeb3AuthEnabled: false,
          authLayout: (authConfig.authLayout ?? []).filter(l => l !== 'EXTERNAL:FULL' && l !== 'EXTERNAL:CONDENSED'),
        });
      }
      if (networkSet.size === 1 && !authConfig.isWeb3AuthEnabled) {
        setAuthConfig({
          ...authConfig,
          isWeb3AuthEnabled: true,
          authLayout: ensureExternalLayout(authConfig),
        });
      }
    },
    [networksConfig, authConfig],
  );

  function ensureExternalLayout(prevAuthConfig: typeof authConfig) {
    const layouts = new Set(prevAuthConfig.authLayout ?? []);
    const hasExternal = [...layouts].some(l => l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED');
    if (!hasExternal) {
      layouts.add('EXTERNAL:FULL');
    }
    return Array.from(layouts);
  }

  function walletIsForNetwork(wallet: string, network: Network) {
    const evmValues = Object.values(EvmWallet) as string[];
    const solValues = Object.values(SolanaWallet) as string[];
    const cosmosValues = Object.values(CosmosWallet) as string[];

    if (network === Network.ETHEREUM && evmValues.includes(wallet)) return true;
    if (network === Network.SOLANA && solValues.includes(wallet)) return true;
    if (network === Network.COSMOS && cosmosValues.includes(wallet)) return true;
    return false;
  }

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
