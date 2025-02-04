import styled from 'styled-components';
import { Card } from './StyledCard';
import { Text } from './StyledText';
import { Button } from './StyledButton';
import { CpslIcon } from '@getpara/react-components';

export const MoreQuestions: React.FC = () => {
  return (
    <StyledCard>
      <Container>
        <Text variant="bodyM" weight="semiBold" color="primary">
          Still have questions?
        </Text>
        <ButtonGroup>
          <ActionButton
            variant="primary"
            onClick={() => window.open('https://calendly.com/d/ynr-2s7-g5f/capsule-partner-call', '_blank')}
            size="small"
          >
            <ButtonContent>
              <WhiteButtonIcon icon="phone" />
              <Text variant="bodyS" weight="medium" color="inverted">
                Talk to us
              </Text>
            </ButtonContent>
          </ActionButton>
          {/* <ActionButton
            variant="secondary"
            onClick={() => window.open('', '_blank')}
            size="small"
          >
            <ButtonContent>
              <ButtonIcon icon="share" />
              <Text variant="bodyS" weight="medium">
                Join the community
              </Text>
            </ButtonContent>
          </ActionButton> */}
        </ButtonGroup>
      </Container>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  padding: 1rem 1.5rem;
  border-radius: 1rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled(Button)``;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WhiteButtonIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #ffffff;
`;
