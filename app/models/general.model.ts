export type FormState = "idle" | "submitting" | "error";

export interface PaginatedResult<T> {
  page: number;
  totalResults: number;
  pageSize: number;
  results: T[];
}

export type SearchParamsPromise = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export interface ServiceResult<T = any> {
  success: boolean;
  data: T | null;
}
