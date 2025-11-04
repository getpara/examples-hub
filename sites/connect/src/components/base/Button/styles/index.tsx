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
        : `linear-gradient(180deg, #343743 0%, #0f0f0f 100%),
linear-gradient(180deg, #4c5057 0%, rgba(56, 59, 65, 0) 87.5%)`};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid;
  border-image-source: linear-gradient(180deg, #4c5057 0%, rgba(56, 59, 65, 0) 87.5%);
  box-shadow: ${({ secondary }) =>
    secondary
      ? '0px 1px 2px 0px rgba(164, 172, 185, 0.24), 0px 0px 0px 1px rgba(18, 55, 105, 0.08);'
      : '0px 0px 0px 1.5px #242628;'};
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
