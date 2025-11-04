import { Col, Row } from '@nextui-org/react';
import { CodeBlock, codepen } from 'react-code-blocks';

import * as Styled from './styles';

/**
 * Types
 */
interface IProps {
  data: Record<string, unknown>;
}

/**
 * Component
 */
export default function RequestDataCard({ data }: IProps) {
  return (
    <Row>
      <Col>
        <Styled.LabelText>Data:</Styled.LabelText>
        <CodeBlock showLineNumbers={false} text={JSON.stringify(data, null, 2)} theme={codepen} language="json" />
      </Col>
    </Row>
  );
}
