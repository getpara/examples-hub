import React from 'react';

import * as Styled from './styles';

interface ButtonProps {
  children: React.ReactNode;
  isFullWidth?: boolean;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}

const Button = ({ children, isFullWidth = false, onClick, secondary = false, disabled, ...rest }: ButtonProps) => {
  return (
    <Styled.Container secondary={secondary} onClick={onClick} isFullWidth={isFullWidth} disabled={disabled} {...rest}>
      {children}
    </Styled.Container>
  );
};

export default Button;
