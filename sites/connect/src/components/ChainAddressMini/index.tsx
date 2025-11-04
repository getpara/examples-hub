import { Flex } from 'rebass';

import * as Styled from './styles';

interface Props {
  address?: string;
}

export default function ChainAddressMini({ address }: Props) {
  if (!address) return <></>;
  return (
    <>
      <Flex alignItems="center">
        <Styled.Text>
          {address.substring(0, 6)}...{address.substring(address.length - 6)}
        </Styled.Text>
        <Styled.CopyIcon
          onClick={() => {
            navigator.clipboard.writeText(address);
          }}
        />
      </Flex>
    </>
  );
}
