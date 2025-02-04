import { CpslCard, CpslSwitch, CpslText } from '@getpara/react-components';
import { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

export function SectionCard({
  accessory,
  title,
  subtitle,
  children,
}: PropsWithChildren<{ accessory?: ReactNode; title?: string; subtitle?: string }>) {
  return (
    <Card>
      <Container>
        {(title || subtitle) && (
          <Heading>
            {title && (
              <CpslText variant="bodyM" weight="semiBold" style={{ position: 'relative' }}>
                {title}
                <div style={{ position: 'absolute', right: '0', top: '0' }}>{accessory}</div>
              </CpslText>
            )}
            {subtitle && <CpslText variant="bodyS">{subtitle}</CpslText>}
          </Heading>
        )}
        {children}
      </Container>
    </Card>
  );
}

export const GreenSwitch = styled(CpslSwitch)`
  --container-background-color-checked: #34a853;
  --container-height: 22px;
  --container-width: 40px;
  --thumb-size: 18px;
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
