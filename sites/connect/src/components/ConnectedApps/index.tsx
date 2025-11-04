import React from 'react';

import * as Styled from './styles';
import ConnectedAppTag from '../ConnectedAppTag';

interface ConnectedAppsProps {
  pairings: {
    topic: string;
    peerMetadata: {
      name: string;
      icons: string[];
    };
  }[];
  onDelete: (topic: string) => void;
}

const ConnectedApps = ({ pairings, onDelete }: ConnectedAppsProps) => {
  return !pairings.length ? (
    <Styled.Container hasApps={!!pairings.length}>
      <Styled.EmptyStateText>No Connected Apps</Styled.EmptyStateText>
    </Styled.Container>
  ) : (
    <Styled.Container hasApps={!!pairings.length}>
      {pairings.map(pair => (
        <ConnectedAppTag key={pair.topic} pair={pair} onDelete={onDelete} />
      ))}
    </Styled.Container>
  );
};

export default ConnectedApps;
