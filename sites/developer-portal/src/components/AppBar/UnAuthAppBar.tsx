import { CpslAppBar } from '@usecapsule/react-components';
import styled from 'styled-components';
import { CapsuleBlack } from '../Icons';

export const UNAUTH_APP_BAR_HEIGHT = 70;

export const UnAuthAppBar = () => {
  return (
    <CpslAppBar height={UNAUTH_APP_BAR_HEIGHT}>
      <Container>
        <LogoContainer>
          <CapsuleBlack />
        </LogoContainer>
      </Container>
    </CpslAppBar>
  );
};

const Container = styled.div`
  background-color: #fff;
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  justify-content: space-between;
  padding-left: 32px;
`;

const LogoContainer = styled.div`
  width: 115px;
  height: 100%;
  display: flex;
  svg {
    width: 115px;
  }
`;
