import styled from 'styled-components';
import { CenteredText } from '../../../components/common';

export const Heading = () => {
  return (
    <Container>
      <CenteredText variant="headingM" weight="semiBold">
        Capsule Developer Portal
      </CenteredText>
      <CenteredText variant="bodyS" weight="medium" color="tertiary">
        Customize, manage, and see analytics for your Capsule instance.
      </CenteredText>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
