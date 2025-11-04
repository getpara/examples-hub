import { Col, Row } from '@nextui-org/react';

import * as Styled from './styles';

/**
 * Types
 */
interface IProps {
  methods: string[];
}

/**
 * Component
 */
export default function RequestMethodCard({ methods }: IProps) {
  return (
    <Row>
      <Col>
        <Styled.LabelText>Methods</Styled.LabelText>
        <Styled.BodyText data-testid="request-methods">{methods.map(method => method).join(', ')}</Styled.BodyText>
      </Col>
    </Row>
  );
}
