import React from 'react';
import styled, { css } from 'styled-components';
import { Switch } from './StyledSwitch';
import { Text } from './StyledText';

interface SwitchItemProps {
  logo?: string;
  label: string;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  disableBackground?: boolean;
  disablePadding?: boolean;
  disableRadius?: boolean;
}

export const SwitchItem: React.FC<SwitchItemProps> = ({
  logo,
  label,
  isChecked,
  onToggle,
  disableBackground,
  disablePadding,
  disableRadius,
}) => {
  return (
    <Container $disableBackground={disableBackground} $disablePadding={disablePadding} $disableRadius={disableRadius}>
      <LeftContent>
        {logo && <LogoImage src={logo} alt={`${label} logo`} />}
        <Text variant="bodyM" weight="medium">
          {label}
        </Text>
      </LeftContent>
      <Switch checked={isChecked} onCheckedChange={checked => onToggle(checked)} />
    </Container>
  );
};

const Container = styled.div<{
  $disableBackground?: boolean;
  $disablePadding?: boolean;
  $disableRadius?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* Conditionally apply padding */
  ${props =>
    !props.$disablePadding &&
    css`
      padding: 1rem;
    `}

  /* Conditionally apply border-radius */
  ${props =>
    !props.$disableRadius &&
    css`
      border-radius: 0.75rem;
    `}

  /* Conditionally apply background color */
  ${props =>
    !props.$disableBackground &&
    css`
      background-color: #f0f0f0;
    `}
`;

const LeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoImage = styled.img`
  width: 1.5rem;
  height: 1.5rem;
`;
