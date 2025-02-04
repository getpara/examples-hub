import { CpslCard, CpslText } from '@getpara/react-components';
import styled from 'styled-components';

export const ProfileInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Card = styled(CpslCard)`
  width: 100%;
`;

export const OverflowText = styled(CpslText)`
  overflow: auto;
`;
