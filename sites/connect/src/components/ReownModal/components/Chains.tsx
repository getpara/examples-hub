import { useMemo } from 'react';
import { Section } from './Section';
import { Avatar, AvatarFallback, AvatarImage, Typography } from '@getpara/react-component-library';
import { ProposalTypes } from '@walletconnect/types';
import { getChainData } from '../../../data/chainsUtil';

type ChainsProps =
  | {
      chainIds: string[];
      requiredNamespaces?: never;
      optionalNamespaces?: never;
    }
  | {
      chainIds?: never;
      requiredNamespaces: ProposalTypes.RequiredNamespaces;
      optionalNamespaces?: ProposalTypes.OptionalNamespaces;
    };

export const Chains = ({ requiredNamespaces, optionalNamespaces, chainIds }: ChainsProps) => {
  const requestedChains = useMemo(() => {
    if (chainIds) {
      return chainIds.map(chainId => getChainData(chainId)).filter(c => !!c);
    }

    if (!requiredNamespaces || !optionalNamespaces) {
      return [];
    }

    const required = [];
    for (const [key, values] of Object.entries(requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }

    const optional = [];
    for (const [key, values] of Object.entries(optionalNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      optional.push(chains);
    }

    const allNamespaces = [...new Set([...required.flat(), ...optional.flat()])];

    return allNamespaces.map(chain => (chain ? getChainData(chain) : undefined)).filter(c => !!c);
  }, [requiredNamespaces, optionalNamespaces]);

  return (
    <Section label={requestedChains.length === 1 ? 'Chain' : 'Chains'}>
      <div className="para:flex para:gap-2 para:flex-wrap">
        {requestedChains.map(chain => (
          <div key={chain?.chainId} className="para:flex para:gap-1 para:items-center">
            <Avatar className="para:size-4">
              <AvatarImage src={chain?.logo} alt={chain?.name} />
              <AvatarFallback className="para:bg-transparent" />
            </Avatar>
            <Typography color="secondary" className="para:text-sm para:font-semibold">
              {chain?.name}
            </Typography>
          </div>
        ))}
      </div>
    </Section>
  );
};
