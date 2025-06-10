import { safeStyled } from '@getpara/react-common';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { PartnerEntity } from '@getpara/user-management-client';

interface PartnerIconProps {
  partner: PartnerEntity;
}

export const PartnerIcon = ({ partner }: PartnerIconProps) => {
  const { logoUrl, displayName, backgroundColor, foregroundColor } = partner;

  if (logoUrl) {
    return <Icon src={logoUrl} />;
  }

  return (
    <Container $backgroundColor={backgroundColor}>
      <Text variant="bodyXS" $color={foregroundColor}>
        {displayName[0]}
      </Text>
    </Container>
  );
};

const Container = safeStyled.div<{ $backgroundColor?: string }>`
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => `${$backgroundColor ?? 'var(--cpsl-color-contrast)'}`};
  border-radius: 100%;
`;

const Text = safeStyled(CpslText)<{ $color?: string }>`
  &::part(text-element) {
    line-height: 100%;
    color: ${({ $color }) => `${$color ?? 'var(--cpsl-color-foreground-0)'}`};
  }
`;

const Icon = safeStyled(CpslIcon)`
  --height: 14px;
  --width: 14px;
`;
