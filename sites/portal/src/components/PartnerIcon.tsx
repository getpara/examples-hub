import { Avatar, Tooltip } from '@chakra-ui/react';
import { Partner } from '../types';
import { getBackground, stringToBinaryAndColor } from '../utils/identicon';

export const PartnerIcon = ({
  partner,
  size = '62px',
  fontSize,
  margin,
}: {
  partner: Partner;
  size?: string;
  fontSize?: string;
  margin?: string;
}) => {
  // const src = partner.logoUrl;
  const src = undefined;

  return (
    <Tooltip
      bgColor="var(--cpsl-color-background-0)"
      color="var(--cpsl-color-foreground-48)"
      padding="8px"
      borderRadius="4px"
      border="1px solid var(--cpsl-color-background-8)"
      fontSize="16px"
      label={partner.displayName}
    >
      <Avatar
        bg={src ? 'var(--cpsl-color-background-8)' : getBackground(stringToBinaryAndColor(partner.id)[1])}
        color={src ? undefined : 'white'}
        w={size}
        h={size}
        m={margin}
        borderRadius={size}
        fontSize={fontSize}
        src={src}
        name={partner.displayName}
      />
    </Tooltip>
  );
};
