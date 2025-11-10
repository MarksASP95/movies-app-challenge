import type { Movie } from "@/app/models/movie.model";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMovieCardElements } from "../useMovieCardElements";

describe("useMovieCardElements", () => {
  const mockMovie: Movie = {
    tmdbId: 123,
    title: "some movie",
    description: "some description",
    posterUrl: "/poster.jpg",
    rating: 8.0,
    releaseDate: {
      year: 2023,
      month: 5,
      day: 15,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("date string formatting", () => {
    it("should format date correctly", () => {
      const { result } = renderHook(() =>
        useMovieCardElements(mockMovie, false)
      );

      expect(result.current.dateStr).toBe("May 15, 2023");
    });

    it("should handle different months", () => {
      const januaryMovie: Movie = {
        ...mockMovie,
        releaseDate: {
          year: 2023,
          month: 1,
          day: 1,
        },
      };

      const { result } = renderHook(() =>
        useMovieCardElements(januaryMovie, false)
      );

      expect(result.current.dateStr).toBe("January 1, 2023");
    });
  });
});
