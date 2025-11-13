import React from 'react';

import * as Styled from './styles';
import ConnectedAppTag from '../ConnectedAppTag';
import { useActiveSessions } from '../../hooks/useActiveSessions';

interface ConnectedAppsProps {
  onDelete: (topic: string) => void;
}

const ConnectedApps = ({ onDelete }: ConnectedAppsProps) => {
  const { data: sessions } = useActiveSessions();

  return !sessions || !Object.keys(sessions).length ? (
    <Styled.Container hasApps={false}>
      <Styled.EmptyStateText>No Connected Apps</Styled.EmptyStateText>
    </Styled.Container>
  ) : (
    <Styled.Container hasApps={true}>
      {Object.values(sessions).map(session => (
        <ConnectedAppTag key={session.topic} session={session} onDelete={onDelete} />
      ))}
    </Styled.Container>
  );
};

export default ConnectedApps;
