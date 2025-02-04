import { CpslAppBar, CpslIcon } from '@getpara/react-components';
import styled from 'styled-components';

export const AUTH_MIN_APP_BAR_HEIGHT = 70;

export const AuthMinAppBar = () => {
  return (
    <CpslAppBar height={AUTH_MIN_APP_BAR_HEIGHT}>
      <Container>
        <Logo icon="para" />
      </Container>
    </CpslAppBar>
  );
};

const Container = styled.div`
  background-color: var(--cpsl-color-background-0);
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  justify-content: space-between;
  padding-left: 32px;
`;

const Logo = styled(CpslIcon)`
  --height: 27px;
  --width: auto;
`;
