export const usePaginationData = ({
  page,
  totalResults,
  pageSize,
  path,
  queryParams = {},
}: {
  page: number;
  totalResults: number;
  pageSize: number;
  path: string;
  queryParams?: Record<string, string>;
}) => {
  const buildUrl = (targetPage: number) => {
    const paramsStr = Object.entries(queryParams)
      .map(([param, value]) => {
        return `${param}=${encodeURIComponent(value)}`;
      })
      .join("&");

    return `${path}?${paramsStr}&page=${targetPage}`;
  };

  const previousUrl = buildUrl(page - 1);
  const nextUrl = buildUrl(page + 1);

  const totalPages = Math.ceil(totalResults / pageSize);
  const showPrevious = page > 1;
  const showNext = !(Math.ceil(totalResults / page) === pageSize);

  return {
    previousUrl,
    nextUrl,
    totalPages,
    showPrevious,
    showNext,
  };
};
