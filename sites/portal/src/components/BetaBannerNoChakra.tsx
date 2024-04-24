import { ENV } from '../constants';
import { Environment } from '@usecapsule/web-sdk';
import styled from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';

export const BetaBannerNoChakra = () => {
  return (
    ENV !== Environment.PROD && (
      <Alert>
        <StyledIcon icon="alertCircle" />
        You're using Capsule in a development (non-production) environment: {ENV}. Be wary of sharing sensitive information.
      </Alert>
    )
  );
};

const Alert = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: lightblue;
`;

const StyledIcon = styled(CpslIcon)`
  --icon-color: black;
`;
