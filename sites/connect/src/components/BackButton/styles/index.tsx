import { BaseContainer as ButtonContainer } from '@/components/base/Button/styles';
import styled from 'styled-components';

export const BackButton = styled(ButtonContainer)<{ isMobile: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ isMobile }) => (isMobile ? '4px' : '8px')};
  height: ${({ isMobile }) => (isMobile ? '30px' : '40px')};
  width: ${({ isMobile }) => (isMobile ? '30px' : '40px')};
`;
