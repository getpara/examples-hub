import { CpslText } from '@getpara/react-components';
import styled from 'styled-components';

export const contentMotionProps = {
  transition: { duration: 0.2 },
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const NoProviders = styled(CpslText)<{ isHidden?: boolean }>`
  width: 100%;
  text-align: center;
  visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'visible')};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: visibility 0.2s;
`;
