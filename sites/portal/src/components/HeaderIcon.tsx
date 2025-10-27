import { safeStyled } from '@getpara/react-common';
import { CpslIcon, IconType } from '@getpara/react-components';

type HeaderIconProps = { icon: IconType };

export const HeaderIcon = ({ icon }: HeaderIconProps) => (
  <IconContainer>
    <Icon icon={icon} />
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
