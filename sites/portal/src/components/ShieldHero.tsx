import { safeStyled } from '@getpara/react-common';
import { CpslIcon } from '@getpara/react-components';

export const ShieldHero = () => (
  <IconContainer>
    <Icon icon="shield" />
  </IconContainer>
);

const IconContainer = safeStyled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid var(--cpsl-color-background-8);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = safeStyled(CpslIcon)`
  color: var(--cpsl-color-contrast);
`;
