import React from 'react';
import { Flex } from 'rebass';

import * as Styled from './styles';

interface ExploreCardProps {
  name: string;
  description?: string;
  url: string;
  isSvg?: boolean;
  renderSvg?: (() => React.ReactNode) | null;
  imageSrc?: string;
}

const ExploreCard = ({ name, description, url, renderSvg = null, imageSrc = '' }: ExploreCardProps) => {
  return (
    <Styled.Container onClick={() => window.open(`${url}`, '_blank')}>
      {!!renderSvg ? (
        <Styled.SvgContainer>{renderSvg()}</Styled.SvgContainer>
      ) : (
        <Styled.ImageContainer>
          <Styled.Image src={imageSrc} />
        </Styled.ImageContainer>
      )}
      <Styled.TitleText>{name}</Styled.TitleText>
      <Styled.DescriptionText>{description}</Styled.DescriptionText>
      <Flex alignItems="center">
        <Styled.LinkText>{`Visit (${name})`}</Styled.LinkText>
        <Styled.LinkArrow />
      </Flex>
    </Styled.Container>
  );
};

export default ExploreCard;
