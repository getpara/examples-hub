import styled from 'styled-components';
import { ReactNode } from 'react';
import { BaseCard } from '../common';
import { MOBILE_SIZE } from '../../utils/constants';

interface SplitCardProps {
  LeftContent?: ReactNode;
  RightContent?: ReactNode;
  isSelected?: boolean;
  flexRow?: boolean;
  onClick?: () => void;
}

export const SplitCard = ({ LeftContent, RightContent, isSelected, flexRow, onClick }: SplitCardProps) => {
  return (
    <Card $isSelected={isSelected} $isSelectable={!!onClick} onClick={onClick}>
      <Container $flexRow={flexRow}>
        {LeftContent}
        {RightContent}
      </Container>
    </Card>
  );
};

const Card = styled(BaseCard)<{
  $isSelected?: boolean;
  $isSelectable?: boolean;
}>`
  max-width: 1200px;

  ${({ $isSelected }) => ($isSelected ? '--card-border-color: var(--cpsl-color-input-border-active)' : '')};

  ${({ $isSelectable }) => ($isSelectable ? 'cursor: pointer' : '')};
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
