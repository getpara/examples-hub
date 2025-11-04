import { getChainData } from '@/data/chainsUtil';
import { Row, Avatar } from '@nextui-org/react';
import { useMemo } from 'react';

import * as Styled from './styles';

interface Props {
  chainId?: string; // namespace + ":" + reference
}

export default function ChainDataMini({ chainId }: Props) {
  const chainData = useMemo(() => getChainData(chainId), [chainId]);

  if (!chainData) return <></>;
  return (
    <div style={{ marginBottom: '5px' }}>
      <Row>
        <Avatar size={'xs'} src={chainData.logo} />
        <Styled.Text style={{ marginLeft: '5px' }}>{chainData.name}</Styled.Text>
      </Row>
    </div>
  );
}
