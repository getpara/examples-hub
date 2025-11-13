import styled from 'styled-components';

export interface ContainerProps {
  isFullWidth: boolean;
  secondary?: boolean;
}

export const BaseContainer = styled.button<Pick<ContainerProps, 'secondary'>>`
  height: 48px;
  gap: 4px;
  background: ${({ secondary, disabled }) =>
    secondary
      ? disabled
        ? 'rgba(255, 255, 255, 0.00)'
        : `linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(193, 199, 208, 0.02) 100%), #FFF;
`
      : disabled
        ? '#343743'
        : 'var(--para-color-foreground)'};
  padding: 12px;
  border-radius: 8px;
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: center;
  color: ${({ secondary }) => (secondary ? 'black' : ' #ffffff')};
  outline: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

export const Container = styled(BaseContainer)<ContainerProps>`
  width: ${({ isFullWidth }) => (isFullWidth ? '100%' : '151px')};
`;
