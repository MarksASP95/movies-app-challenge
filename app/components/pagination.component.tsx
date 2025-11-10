import { usePaginationData } from "@/app/hooks/usePaginationData";
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
  const { nextUrl, previousUrl, showNext, showPrevious, totalPages } =
    usePaginationData({
      page,
      pageSize,
      path,
      totalResults,
      queryParams,
    });
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
