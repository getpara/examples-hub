import {
  CpslCard,
  CpslIcon,
  CpslInput,
  CpslRow,
  CpslSelect,
  CpslSwitch,
  CpslText,
  IconType,
} from '@usecapsule/react-components';
import { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

export function SectionCard({
  accessory,
  title,
  subtitle,
  children,
}: PropsWithChildren<{ accessory?: ReactNode; title: string; subtitle: string }>) {
  return (
    <Card>
      <Container>
        <Heading>
          <CpslText variant="bodyM" weight="semiBold" style={{ position: 'relative' }}>
            {title}
            <div style={{ position: 'absolute', right: '0', top: '0' }}>{accessory}</div>
          </CpslText>
          <CpslText variant="bodyS">{subtitle}</CpslText>
        </Heading>
        {children}
      </Container>
    </Card>
  );
}

export function OptionDisplay({ name, icon, slot }: { name: string; icon: IconType; slot?: string }) {
  return (
    <CpslRow
      {...(slot ? { slot } : {})}
      style={{ alignItems: 'center', gap: '8px', flex: 1, width: '100%', position: 'relative' }}
    >
      <CpslIcon icon={icon} />
      <CpslText variant="bodyM" style={{ fontWeight: '500', flex: 1 }}>
        {name}
      </CpslText>
    </CpslRow>
  );
}

export const GreenSwitch = styled(CpslSwitch)`
  --container-background-color-checked: #34a853;
`;

const Card = styled(CpslCard)`
  --card-border-radius-tl: 16px;
  --card-border-radius-tr: 16px;
  --card-border-radius-bl: 16px;
  --card-border-radius-br: 16px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Heading = styled(Container)`
  gap: 4px;
`;

export const InnerSelect = styled(CpslSelect)`
  --container-border-color: #bbb;
  --cpsl-color-select-border-active: #a0a0a0;

  flex: 1;
`;

export const InnerInput = styled(CpslInput)`
  --container-border-color: #bbb;
`;
