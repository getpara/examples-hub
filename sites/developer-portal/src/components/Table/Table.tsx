import { CpslPagination, CpslTable, CpslText } from '@getpara/react-components';
import { ReactElement } from 'react';
import styled from 'styled-components';
import { CpslPaginationCustomEvent } from '@getpara/core-components';
import { MOBILE_SIZE } from '../../utils/constants';
import { AUTH_APP_BAR_HEIGHT } from '../AppBar/AuthAppBar/AuthAppBar';

export type TableData = {
  key: string;
  data: {
    key: string;
    align?: 'left' | 'right' | 'center';
    fitWidth?: boolean;
    value: string | number | ReactElement;
  }[];
};

type TableHeader = {
  headerName: string;
  colSpan?: number;
  align?: 'left' | 'right' | 'center';
};

interface TableProps {
  data: TableData[];
  headers: TableHeader[];
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  title: string;
  subtitle: string;
  ActionButton?: ReactElement;
  noContentTitle: string;
  noContentSubtitle?: string;
  NoContentActionButton?: ReactElement;
}

export function Table({
  data,
  headers,
  title,
  subtitle,
  ActionButton,
  noContentTitle,
  noContentSubtitle,
  NoContentActionButton,
  totalPages,
  page,
  onPageChange,
}: TableProps) {
  const handlePageChange = (e: CpslPaginationCustomEvent<number>) => {
    onPageChange(e.detail);
  };

  return (
    <OuterContainer $noData={!data.length}>
      <InnerContainer key={data.length}>
        <Header slot="header">
          <HeaderLabelContainer>
            <CpslText variant="headingXS" weight="semiBold">
              {title}
            </CpslText>
            <CpslText variant="bodyS" color="secondary">
              {subtitle}
            </CpslText>
          </HeaderLabelContainer>
          {ActionButton}
        </Header>
        {data.length ? (
          <>
            <table className="cpsl-table sticky-header" slot="content">
              <thead>
                <tr>
                  {headers.map(header => (
                    <th key={header.headerName} colSpan={header.colSpan} align={header.align ?? 'left'}>
                      {header.headerName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(row => {
                  return (
                    <tr key={row.key}>
                      {row.data.map(d => {
                        if (typeof d.value === 'string' || typeof d.value === 'number') {
                          return (
                            <td key={d.key} align={d.align}>
                              <CpslText variant="bodyS">{d.value}</CpslText>
                            </td>
                          );
                        } else {
                          return d.fitWidth ? (
                            <FitWidthColumn key={d.key}>
                              <CpslText variant="bodyS">{d.value}</CpslText>
                            </FitWidthColumn>
                          ) : (
                            <td key={d.key}>{d.value}</td>
                          );
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Footer slot="footer">
              <CpslPagination onCpslPaginationChanged={handlePageChange} totalPages={totalPages} initialPage={page} />
            </Footer>
          </>
        ) : (
          <NoContent slot="content">
            <NoContentText>
              <CpslText variant="headingXS" weight="semiBold">
                {noContentTitle}
              </CpslText>
              {noContentSubtitle && <CpslText variant="bodyM">{noContentSubtitle}</CpslText>}
            </NoContentText>
            {NoContentActionButton && <div>{NoContentActionButton}</div>}
          </NoContent>
        )}
      </InnerContainer>
    </OuterContainer>
  );
}

const OuterContainer = styled.div<{ $noData: boolean }>`
  display: flex;
  min-height: ${({ $noData }) => ($noData ? '500px' : '0px')};
  max-width: 1200px;

  @media (max-width: ${MOBILE_SIZE}px) {
    height: calc(100vh - ${AUTH_APP_BAR_HEIGHT}px);
    margin-left: -16px;
    margin-right: -16px;
    margin-bottom: -16px;
    --container-border-radius: 0px;
    --container-border-width: 0px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    max-height: calc(100vh - ${AUTH_APP_BAR_HEIGHT}px);
  }
`;

const InnerContainer = styled(CpslTable)`
  flex: 1;
  max-width: 100vw;
  width: 100%;

  @media (max-width: ${MOBILE_SIZE}px) {
    --container-border-radius: 0px;
    --container-border-width: 0px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const HeaderLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NoContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const NoContentText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FitWidthColumn = styled.td`
  width: 1px;
  white-space: nowrap;
`;
