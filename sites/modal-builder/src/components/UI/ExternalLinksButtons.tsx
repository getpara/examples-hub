import React from 'react';
import styled from 'styled-components';
import { CpslIcon } from '@getpara/react-components';
import { Button } from './StyledButton';
import { Text } from './StyledText';

export const ExternalLinksButtons: React.FC = () => {
  return (
    <ButtonGroup>
      <ActionButton variant="secondary" onClick={() => window.open('https://docs.getpara.com/', '_blank')} size="small">
        <ButtonContent>
          <Text variant="bodyS" weight="medium" color="primary">
            Docs
          </Text>
          <ButtonIcon icon="linkExternal" />
        </ButtonContent>
      </ActionButton>

      <ActionButton variant="primary" onClick={() => window.open('https://developer.getpara.com/', '_blank')} size="small">
        <ButtonContent>
          <Text variant="bodyS" weight="medium" color="inverted">
            Dev Portal
          </Text>
          <WhiteButtonIcon icon="linkExternal" />
        </ButtonContent>
      </ActionButton>
    </ButtonGroup>
  );
};

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

const ButtonIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #000000;
`;

const WhiteButtonIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #ffffff;
`;
