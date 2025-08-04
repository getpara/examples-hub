import { CpslIcon, CpslSpinner, CpslText, IconType } from '@getpara/react-components';
import { PropsWithChildren, ReactNode } from 'react';
import { safeStyled } from '../utils/index.js';

type Status = 'pending' | 'error' | 'idle' | 'success';

export function HeroSpinner({
  icon,
  status = 'idle',
  text,
  secondaryText,
}: PropsWithChildren<{ icon?: IconType | ReactNode; status?: Status; text?: ReactNode; secondaryText?: ReactNode }>) {
  return (
    <Root>
      <Hero>
        <Spinner size={155} barWidth={8} variant={status} />
        {typeof icon === 'string' ? <CpslIcon icon={icon} size="80px" /> : icon}
      </Hero>
      <Text status={status}>
        {status === 'error' && <CpslIcon icon="alertCircle" size="16px" style={{ stroke: 'currentColor' }} />}
        {status === 'success' && <CpslIcon icon="checkCircle" size="16px" style={{ stroke: 'currentColor' }} />}
        <CpslText
          variant="bodyM"
          weight="semiBold"
          align="center"
          color={status === 'error' ? 'error' : status === 'success' ? 'success' : 'primary'}
        >
          {text}
        </CpslText>
      </Text>
      {secondaryText && (
        <SecondaryText align="center" color="secondary" variant="semiBold">
          {secondaryText}
        </SecondaryText>
      )}
    </Root>
  );
}

const Root = safeStyled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Hero = safeStyled.div`
  width: 150px;
  height: 150px;
  margin: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Text = safeStyled.div<{ status: Status }>`
  display: flex;
  gap: 4px;
  align-items: center;
  color: ${({ status }) =>
    status === 'error'
      ? 'var(--cpsl-color-utility-red)'
      : status === 'success'
        ? 'var(--cpsl-color-utility-green)'
        : 'auto'};
`;

const SecondaryText = safeStyled(CpslText)`
  margin-top: 8px;
`;

const Spinner = safeStyled(CpslSpinner)`
  position: absolute;
  width: 150px;
  height: 150px;
  top: 0;
  left: 0;
  right: 0;
  transition: 0.2s color;
`;
