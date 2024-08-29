import { CpslText } from '@usecapsule/react-components';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { BaseCard, LINEAR_GRADIENT } from '../common';

interface HighlightedCardProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

export const HighlightedCard = ({ title, subtitle, children }: HighlightedCardProps) => {
  return (
    <BorderWrapper>
      <Card>
        <Container>
          <CpslText variant="bodyL" weight="semiBold">
            {title}
          </CpslText>
          <CpslText variant="bodyS" color="secondary">
            {subtitle}
          </CpslText>
          {children}
        </Container>
      </Card>
    </BorderWrapper>
  );
};

const BorderWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 1px;
  background: ${LINEAR_GRADIENT};
  border-radius: var(--cpsl-border-radius-card);
`;

const Card = styled(BaseCard)`
  --card-border-width: 0px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
