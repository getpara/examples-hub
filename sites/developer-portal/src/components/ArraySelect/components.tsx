import { PropsWithChildren, ReactNode, useState } from 'react';
import { CpslIcon, CpslRow } from '@usecapsule/react-components';
import { Reorder, useDragControls } from 'framer-motion';
import styled from 'styled-components';

export function Row<T>({
  children,
  isOrderable = false,
  value,
  title,
}: PropsWithChildren<{ value?: T; title?: ReactNode; isOrderable: boolean }>) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  const Content = (
    <Item>
      <div
        onPointerDown={
          isOrderable
            ? e => {
                controls.start(e);
                setIsDragging(true);
              }
            : undefined
        }
        onPointerUp={
          isOrderable
            ? () => {
                setIsDragging(false);
              }
            : undefined
        }
        style={isOrderable ? { cursor: isDragging ? 'grabbing' : 'grab' } : undefined}
      >
        <CpslIcon icon="dots" />
      </div>
      <RowContent>
        {title && <RowTitle>{title}</RowTitle>}
        {children && <RowChildren>{children}</RowChildren>}
      </RowContent>
    </Item>
  );

  return isOrderable ? (
    <Reorder.Item
      as="div"
      style={{ listStyle: 'none' }}
      value={value?.toString()}
      dragListener={false}
      dragControls={controls}
      layout="position"
    >
      {Content}
    </Reorder.Item>
  ) : (
    Content
  );
}

const Item = styled.div`
  display: flex;
  padding: 16px;
  align-items: flex-start;
  min-height: 24px;
  gap: 16px;
  align-self: stretch;
  border-radius: 12px;
  background: var(--Background-4, #f0f0f0);
`;

const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1;
  align-items: flex-start;
  gap: 16px;
`;

const RowTitle = styled(CpslRow)`
  height: 24px;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
`;

const RowChildren = styled.div`
  gap: 8px;
  width: 100%;
`;
