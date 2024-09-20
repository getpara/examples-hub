import { CpslButton, CpslIcon, CpslRow, CpslText } from '@usecapsule/react-components';
import { Fragment, PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

export function ArraySelect<T extends { toString: () => string }, const E = undefined>({
  value,
  onChange,
  remaining,
  includeAdded = false,
  isOrderable,
  ifEmpty: E,
  error,
  emptyText = 'Any',
  rowTitle,
  rowEnd,
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
  rowTitle: (_: T) => ReactNode;
  rowEnd?: (_: T) => ReactNode;
  rowChild?: (_: T) => ReactNode;
}>) {
  return (
    <Container>
      {value && Array.isArray(value) && value.length > 0 ? (
        value.map((item, index) => {
          return (
            <Fragment key={`${item.toString()}`}>
              <Item>
                <CpslText>{rowTitle(item)}</CpslText>
                <RowEnd>{rowEnd && rowEnd(item)}</RowEnd>
                <CpslRow>
                  {isOrderable && value.length > 1 && (
                    <>
                      <CpslButton
                        variant="ghost"
                        aria-label="Move up"
                        disabled={index === 0 || value.length === 1}
                        onClick={() => {
                          onChange([
                            ...value.slice(0, index - 1),
                            value[index],
                            value[index - 1],
                            ...value.slice(index + 1),
                          ]);
                        }}
                      >
                        <UpIcon icon="arrow" />
                      </CpslButton>
                      <CpslButton
                        variant="ghost"
                        aria-label="Move down"
                        disabled={index === value.length - 1 || value.length === 1}
                        onClick={() => {
                          onChange([...value.slice(0, index), value[index + 1], value[index], ...value.slice(index + 2)]);
                        }}
                      >
                        <DownIcon icon="arrow" />
                      </CpslButton>
                    </>
                  )}
                  <CpslButton
                    variant="ghost"
                    aria-label="Remove"
                    onClick={() => {
                      onChange(value.length === 1 ? E : [...value.slice(0, index), ...value.slice(index + 1)]);
                    }}
                  >
                    <CpslIcon icon="x" />
                  </CpslButton>
                </CpslRow>
              </Item>
              {rowChild && rowChild(item)}
            </Fragment>
          );
        })
      ) : (
        <EmptyView isError={!!error}>{!!error ? error : emptyText}</EmptyView>
      )}
      {remaining && (
        <AddItemsContainer>
          {remaining
            .filter(i => (!includeAdded ? value === E || (Array.isArray(value) && !value.includes(i)) : true))
            .map(item => {
              return (
                <CpslButton
                  variant="ghost"
                  onClick={() => {
                    onChange([...(Array.isArray(value) ? value : []), item]);
                  }}
                >
                  <CpslIcon icon="plusCircle" />
                  {rowTitle(item)}
                </CpslButton>
              );
            })}
        </AddItemsContainer>
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

const Item = styled.div`
  padding: 0 12px;
  display: flex;
  height: 44px;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  border: 1px solid #ddd;

  &:hover {
    border: 1px solid #ccc;
  }
`;

const EmptyView = styled.div<{ isError?: boolean }>`
  padding: 0 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  height: 44px;
  text-align: left;
  border: ${({ isError }) => (isError ? '1px dashed red' : '1px dashed #ccc')};
  color: ${({ isError }) => (isError ? 'red' : '#999')};
`;

const AddItemsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  row-gap: 8px;
`;

const UpIcon = styled(CpslIcon)`
  transform: rotate(-90deg);
`;

const DownIcon = styled(CpslIcon)`
  transform: rotate(90deg);
`;

const RowEnd = styled(CpslRow)`
  flex-grow: 1;
`;
