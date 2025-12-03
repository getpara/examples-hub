import { CpslText } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';

export const NoProviders = safeStyled(CpslText)<{ isHidden?: boolean }>`
  width: 100%;
  text-align: center;
  visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'visible')};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: visibility 0.2s;
`;
