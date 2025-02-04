import { CpslIcon } from '@getpara/react-components';
import { ReactNode } from 'react';
import styled from 'styled-components';

export const ConnectDiagram = ({ left, right }: { left: ReactNode; right: ReactNode }) => {
  return (
    <Root>
      <ConnectDiagramIcon>{left}</ConnectDiagramIcon>
      <ConnectDiagramIcon>{right}</ConnectDiagramIcon>
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
`;

const ConnectDiagramIcon = styled.div`
  background-color: black;
  border-radius: 16px;
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  border: 1px solid #f6f6f6;

  & span,
  div,
  img {
    border-radius: 16px !important;
  }
`;

export const ParaIcon = styled(CpslIcon)`
  --icon-color: white;
  --height: 38px;
  --width: 38px;
`;
