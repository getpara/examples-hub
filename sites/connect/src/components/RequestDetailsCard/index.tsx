import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data';
import { Col, Divider, Row } from '@nextui-org/react';
import { Fragment } from 'react';

import * as Styled from './styles';

/**
 * Types
 */
interface IProps {
  chains: string[];
  protocol: string;
}

/**
 * Component
 */
export default function RequestDetailsCard({ chains, protocol }: IProps) {
  return (
    <Fragment>
      <Row>
        <Col>
          <Styled.LabelText>Blockchains:</Styled.LabelText>
          <Styled.BodyText data-testid="request-details-chain">
            {chains.map(chain => EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain).join(', ')}
          </Styled.BodyText>
        </Col>
      </Row>

      <Divider y={2} />

      <Row>
        <Col>
          <Styled.LabelText>Relay Protocol:</Styled.LabelText>
          <Styled.BodyText data-testid="request-detauls-realy-protocol">{protocol}</Styled.BodyText>
        </Col>
      </Row>
    </Fragment>
  );
}
