import styled from 'styled-components';
import { UnderlinedText } from '../../../components/common';
import { CpslText } from '@usecapsule/react-components';
import { PRIVACY_POLICY, TOS } from '../../../utils/constants';

export const Footer = () => {
  return (
    <Container>
      <CpslText variant="bodyS" color="tertiary">
        © {new Date().getFullYear()} Capsule Labs, Inc.
      </CpslText>
      <UnderlinedText variant="bodyS" color="tertiary">
        <a href={TOS} target="_blank">
          Terms and Conditions
        </a>
      </UnderlinedText>
      <UnderlinedText variant="bodyS" color="tertiary">
        <a href={PRIVACY_POLICY} target="_blank">
          Privacy Policy
        </a>
      </UnderlinedText>
    </Container>
  );
};

const Container = styled.div`
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;
