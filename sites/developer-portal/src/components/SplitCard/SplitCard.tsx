import styled from 'styled-components';
import { ReactNode } from 'react';
import { BaseCard, LINEAR_GRADIENT } from '../common';
import { MOBILE_SIZE } from '../../utils/constants';

interface SplitCardProps {
  LeftContent?: ReactNode;
  RightContent?: ReactNode;
  isSelected?: boolean;
  flexRow?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
}

export const SplitCard = ({ LeftContent, RightContent, isSelected, flexRow, highlighted, onClick }: SplitCardProps) => {
  const Content = (
    <Card $highlighted={highlighted} $isSelected={isSelected} $isSelectable={!!onClick} onClick={onClick}>
      <Container $flexRow={flexRow}>
        {LeftContent}
        {RightContent}
      </Container>
    </Card>
  );

  return highlighted ? <HighlightedWrapper>{Content}</HighlightedWrapper> : Content;
};

const HighlightedWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 1px;
  background: ${LINEAR_GRADIENT};
  border-radius: var(--cpsl-border-radius-card);
  box-shadow: 0px 4px 20px 0px rgba(156, 30, 255, 0.1);
`;

const Card = styled(BaseCard)<{
  $isSelected?: boolean;
  $isSelectable?: boolean;
  $highlighted?: boolean;
}>`
  max-width: 1200px;

  ${({ $isSelected }) => ($isSelected ? '--card-border-color: var(--cpsl-color-input-border-active)' : '')};

  ${({ $isSelectable }) => ($isSelectable ? 'cursor: pointer' : '')};
  ${({ $highlighted }) => ($highlighted ? '--card-border-width: 0px' : '')};
`;

const Container = styled.div<{ $flexRow?: boolean }>`
  display: flex;

  @media (max-width: ${MOBILE_SIZE}px) {
    gap: 16px;
    flex-direction: ${({ $flexRow }) => ($flexRow ? 'row' : 'column')};
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    gap: 24px;
  }
`;

export const SplitCardInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;
