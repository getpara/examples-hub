import { CpslIcon, CpslSpinner, CpslText, IconType } from '@getpara/react-components';
import { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

type Status = 'loading' | 'error' | 'inactive';

export function HeroSpinner({
  icon,
  status = 'inactive',
  text,
}: PropsWithChildren<{ icon?: IconType; status?: Status; text?: ReactNode }>) {
  return (
    <Root>
      <Hero>
        <Spinner size={150} barWidth={9} variant={status === 'loading' ? 'default' : status} />
        {icon && <CpslIcon icon={icon} size="80px" />}
      </Hero>
      <Text status={status}>
        {status === 'error' && <CpslIcon icon="alertCircle" size="16px" style={{ stroke: 'currentColor' }} />}
        <CpslText variant="bodyM" weight="semiBold" color={status === 'error' ? 'error' : 'primary'}>
          {text}
        </CpslText>
      </Text>
    </Root>
  );
}

const Root = styled.div`
  height: 276px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const Hero = styled.div`
  width: 150px;
  height: 150px;
  margin: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Text = styled.div<{ status: Status }>`
  display: flex;
  gap: 4px;
  align-items: center;
  color: ${({ status }) => (status === 'error' ? 'var(--cpsl-color-utility-red)' : 'auto')};
`;

const Spinner = styled(CpslSpinner)`
  position: absolute;
  width: 150px;
  height: 150px;
  top: 0;
  left: 0;
  right: 0;
`;
