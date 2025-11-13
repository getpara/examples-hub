import React, { useState } from 'react';

import * as Styled from './styles';
import { SessionTypes } from '@walletconnect/types';

interface ConnectedAppTagProps {
  session: SessionTypes.Struct;
  onDelete: (topic: string) => void;
}

const ConnectedAppTag = ({ session, onDelete }: ConnectedAppTagProps) => {
  const [isHoveringState, setIsHoveringState] = useState(false);
  const {
    topic,
    peer: { metadata: peerMetadata },
  } = session;

  return (
    <Styled.Tag onMouseEnter={() => setIsHoveringState(true)} onMouseLeave={() => setIsHoveringState(false)} key={topic}>
      <Styled.TagIcon backgroundImageUrl={peerMetadata?.icons[0] ?? ''}></Styled.TagIcon>
      <Styled.TagName>{peerMetadata?.name}</Styled.TagName>
      {isHoveringState && <Styled.DeleteTag onClick={() => onDelete(topic)} />}
    </Styled.Tag>
  );
};

export default ConnectedAppTag;
