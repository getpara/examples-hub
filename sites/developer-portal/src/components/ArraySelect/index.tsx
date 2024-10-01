import { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';
import { Reorder } from 'framer-motion';
import { Row } from './components.js';

export function ArraySelect<T extends { toString: () => string }, const E = undefined>({
  value,
  onChange,
  isOrderable = false,
  ifEmpty: E,
  rowTitle,
  rowAdd,
  rowChild,
}: PropsWithChildren<{
  value: T[] | E;
  remaining?: T[];
  includeAdded?: boolean;
  isOrderable?: boolean;
  ifEmpty: E;
  emptyText?: string;
  error?: string;
  onChange: (_: T[] | E) => void;
  rowTitle?: (_: T) => ReactNode;
  rowEnd?: (_: T) => ReactNode;
  rowChild?: (_: T) => ReactNode;
  rowAdd?: () => ReactNode;
}>) {
  const isPopulated = value && value !== E && Array.isArray(value) && value.length > 0;
  const Content = isPopulated ? (
    <>
      {value.map(item => {
        return (
          <Row key={item.toString()} value={item} title={rowTitle?.(item)} isOrderable={isOrderable}>
            {rowChild?.(item)}
          </Row>
        );
      })}
      {rowAdd && <Row isOrderable={isOrderable}>{rowAdd()}</Row>}
    </>
  ) : null;

  return (
    <Container>
      {isPopulated ? (
        isOrderable ? (
          <Reorder.Group
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            as="div"
            values={value}
            onReorder={onChange}
          >
            {Content}
          </Reorder.Group>
        ) : (
          Content
        )
      ) : (
        <>{rowAdd && <Row isOrderable={isOrderable}>{rowAdd()}</Row>}</>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  gap: 8px;
`;
