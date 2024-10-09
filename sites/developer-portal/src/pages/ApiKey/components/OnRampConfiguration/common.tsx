import { CpslIcon, CpslInput, CpslRow, CpslSelect, CpslText, IconType } from '@usecapsule/react-components';
import styled from 'styled-components';

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

export const InnerSelect = styled(CpslSelect)`
  --container-border-color: #bbb;
  --cpsl-color-select-border-active: #a0a0a0;

  flex: 1;
`;

export const InnerInput = styled(CpslInput)`
  --container-border-color: #bbb;
`;

export const BrandIcon = styled(CpslIcon)`
  --width: 20px;
  --height: 20px;
`;
