import { useCallback, useState } from "react";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

const DEFAULT_PAGE_SIZE = 10;

export function usePagination<Item>(items: Item[]) {
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);

  const goToPage = useCallback(
    (nextPage: number) => {
      setRequestedPage(Math.max(1, Math.min(nextPage, pageCount)));
    },
    [pageCount]
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setRequestedPage(1);
  }, []);

  return {
    pageItems: items.slice(startIndex, endIndex),
    page,
    pageCount,
    pageSize,
    startIndex,
    endIndex,
    goToPage,
    setPageSize,
  };
}
