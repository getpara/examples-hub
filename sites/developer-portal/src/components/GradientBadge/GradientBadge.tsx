import { CpslIcon, CpslText, IconType } from '@getpara/react-components';
import styled from 'styled-components';
import { LINEAR_GRADIENT } from '../common';

interface GradientBadgeProps {
  text: string;
  icon?: IconType;
}

export const GradientBadge = ({ text, icon }: GradientBadgeProps) => {
  return (
    <Container>
      {icon && <StyledIcon icon={icon} />}
      <CpslText color="inverted" variant="body2XS" weight="medium">
        {text}
      </CpslText>
    </Container>
  );
};

const StyledIcon = styled(CpslIcon)`
  --width: 10px;
  --height: 10px;

  --icon-color: var(--cpsl-color-text-inverted);
`;

const Container = styled.span`
  padding: 4px;
  background: ${LINEAR_GRADIENT};
  border-radius: 4px;

  display: flex;
  gap: 4px;
  align-items: center;
`;
