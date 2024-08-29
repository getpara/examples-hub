import { CpslPagination } from '@usecapsule/react-components';
import { memo } from 'react';
import styled from 'styled-components';
import { CpslPaginationCustomEvent } from '@usecapsule/core-components';

interface TableFooterProps {
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TableFooter = memo(({ totalPages, onPageChange }: TableFooterProps) => {
  const handlePageChange = (e: CpslPaginationCustomEvent<number>) => {
    onPageChange(e.detail);
  };

  return (
    <Footer slot="footer">
      <CpslPagination onCpslPaginationChanged={handlePageChange} totalPages={totalPages} />
    </Footer>
  );
});

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
