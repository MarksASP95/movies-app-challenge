import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePaginationData } from "../usePaginationData";

describe("usePaginationData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("path build", () => {
    it("should build the page url keeping the current query params", () => {
      const { result } = renderHook(() =>
        usePaginationData({
          page: 2,
          pageSize: 20,
          path: "/cool-movies",
          totalResults: 238,
          queryParams: { param1: "param1", param2: "param2" },
        })
      );
      expect(result.current.nextUrl).toBe(
        "/cool-movies?param1=param1&param2=param2&page=3"
      );
      expect(result.current.previousUrl).toBe(
        "/cool-movies?param1=param1&param2=param2&page=1"
      );
    });

    it("should hide showPrevious if page is 1", () => {
      const { result } = renderHook(() =>
        usePaginationData({
          page: 1,
          pageSize: 20,
          path: "/cool-movies",
          totalResults: 238,
          queryParams: { param1: "param1", param2: "param2" },
        })
      );
      expect(result.current.showPrevious).toBe(false);
    });

    it("should show showPrevious if page is not 1", () => {
      const { result } = renderHook(() =>
        usePaginationData({
          page: 3,
          pageSize: 20,
          path: "/cool-movies",
          totalResults: 238,
          queryParams: { param1: "param1", param2: "param2" },
        })
      );
      expect(result.current.showPrevious).toBe(true);
    });

    it("should hide showNext if page is last", () => {
      const { result } = renderHook(() =>
        usePaginationData({
          page: 12,
          pageSize: 20,
          path: "/cool-movies",
          totalResults: 238,
          queryParams: { param1: "param1", param2: "param2" },
        })
      );
      expect(result.current.showNext).toBe(false);
    });

    it("should show showNext if page is not last", () => {
      const { result } = renderHook(() =>
        usePaginationData({
          page: 8,
          pageSize: 20,
          path: "/cool-movies",
          totalResults: 238,
          queryParams: { param1: "param1", param2: "param2" },
        })
      );
      expect(result.current.showNext).toBe(true);
    });
  });
});
