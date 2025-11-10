import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRatingStars } from "../useRatingStars";

describe("useRatingStars", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("starts", () => {
    it("should always return 10 stars", () => {
      const { result } = renderHook(() => useRatingStars(7.5));

      expect(result.current.starsElements).toHaveLength(10);
    });

    it("should handle rating of 0", () => {
      const { result } = renderHook(() => useRatingStars(0));

      expect(result.current.starsElements).toHaveLength(10);
    });

    it("should handle rating of 10", () => {
      const { result } = renderHook(() => useRatingStars(10));

      expect(result.current.starsElements).toHaveLength(10);
    });
  });
});
