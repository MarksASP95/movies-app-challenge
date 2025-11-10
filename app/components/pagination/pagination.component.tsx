import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Pagination({
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
}) {
  // todo: unit test
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
  return (
    <div className="flex justify-center mt-4 mb-4">
      {showPrevious && (
        <Link className="mx-2" href={previousUrl}>
          <ArrowLeft />
        </Link>
      )}
      <div className="mx-2">
        {page} / {totalPages}
      </div>
      {showNext && (
        <Link className="mx-2" href={nextUrl}>
          <ArrowRight />
        </Link>
      )}
    </div>
  );
}
