import React, { useState } from 'react';

import * as Styled from './styles';

interface ConnectedAppTagProps {
  pair: {
    topic: string;
    peerMetadata: {
      name: string;
      icons: string[];
    };
  };
  onDelete: (topic: string) => void;
}

const ConnectedAppTag = ({ pair, onDelete }: ConnectedAppTagProps) => {
  const [isHoveringState, setIsHoveringState] = useState(false);
  const { peerMetadata } = pair;

  return (
    <Styled.Tag
      onMouseEnter={() => setIsHoveringState(true)}
      onMouseLeave={() => setIsHoveringState(false)}
      key={pair.topic}
    >
      <Styled.TagIcon backgroundImageUrl={peerMetadata?.icons[0] ?? ''}></Styled.TagIcon>
      <Styled.TagName>{peerMetadata?.name}</Styled.TagName>
      {isHoveringState && <Styled.DeleteTag onClick={() => onDelete(pair.topic)} />}
    </Styled.Tag>
  );
};

export default ConnectedAppTag;
