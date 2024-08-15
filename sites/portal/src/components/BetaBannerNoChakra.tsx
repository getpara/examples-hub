import { ENV } from '../constants';
import { Environment } from '@usecapsule/web-sdk';
import { styled } from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
import { useState } from 'react';

export const BetaBannerNoChakra = () => {
  const [isOpen, setIsOpen] = useState(true);

  return isOpen
    ? ENV !== Environment.PROD && (
        <Alert>
          <CloseButton onClick={() => setIsOpen(false)}>
            <StyledIcon icon="x" />
          </CloseButton>
          <StyledIcon icon="alertCircle" />
          You're using Capsule in a development (non-production) environment: {ENV}. Be wary of sharing sensitive
          information.
        </Alert>
      )
    : null;
};

const Alert = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: lightblue;
  position: fixed;
  left: 8px;
  right: 8px;
  top: 8px;
  z-index: 9999;
`;

const StyledIcon = styled(CpslIcon)`
  --icon-color: black;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
`;
