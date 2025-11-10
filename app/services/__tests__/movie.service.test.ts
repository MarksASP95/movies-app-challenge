import { beforeEach, describe, expect, it, vi } from "vitest";
import { MovieService } from "../movie.service";

// Mock fetch globally
global.fetch = vi.fn();

describe("MovieService", () => {
  let movieService: MovieService;
  const mockTmdbToken = "test-token";

  beforeEach(() => {
    movieService = new MovieService();
    vi.clearAllMocks();
    process.env.TMDB_READ_ACCESS_TOKEN = mockTmdbToken;
  });

  describe("movieFromJson", () => {
    it("should transform json movie with complete data", () => {
      const rawMovie = {
        id: 123,
        original_title: "some movie",
        poster_path: "/poster.jpg",
        release_date: "2023-05-15",
        overview: "some description",
        vote_average: 8,
        title: "some movie",
      };

      // Access private method via type assertion
      const result = (movieService as any).movieFromJson(rawMovie);

      expect(result).toEqual({
        tmdbId: 123,
        title: "some movie",
        description: "some description",
        posterUrl: "https://image.tmdb.org/t/p/original/poster.jpg",
        rating: 8,
        releaseDate: {
          year: 2023,
          month: 5,
          day: 15,
        },
      });
    });

    it("should handle movie without poster path", () => {
      const rawMovie = {
        id: 456,
        original_title: "No Poster Movie",
        poster_path: null,
        release_date: "2020-01-01",
        overview: "Description",
        vote_average: 7.0,
        title: "No Poster Movie",
      };

      const result = (movieService as any).movieFromJson(rawMovie);

      expect(result.posterUrl).toBeNull();
      expect(result.tmdbId).toBe(456);
    });

    it("should handle movie without release date", () => {
      const rawMovie = {
        id: 789,
        original_title: "No Date Movie",
        poster_path: "/poster.jpg",
        release_date: undefined,
        overview: "Description",
        vote_average: 6.5,
        title: "No Date Movie",
      };

      const result = (movieService as any).movieFromJson(rawMovie);

      expect(result.releaseDate).toBeNull();
    });
  });

  describe("movieFromDB", () => {
    it("should transform database movie with release date", () => {
      const dbMovie = {
        id: 1,
        title: "DB Movie",
        description: "Description",
        posterUrl: "/poster.jpg",
        year: 2022,
        month: 6,
        day: 20,
        rating: 9.0,
        tmdbId: 999,
      };

      const result = (movieService as any).movieFromDB(dbMovie);

      expect(result).toEqual({
        title: "DB Movie",
        description: "Description",
        posterUrl: "/poster.jpg",
        rating: 9.0,
        tmdbId: 999,
        releaseDate: {
          year: 2022,
          month: 6,
          day: 20,
        },
      });
    });
  });

  describe("fetchTMDB", () => {
    it("should return success with data on successful API call", async () => {
      const mockData = { results: [] };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await (movieService as any).fetchTMDB(
        "https://api.test.com"
      );

      expect(result).toEqual({
        success: true,
        data: mockData,
      });
      expect(global.fetch).toHaveBeenCalledWith("https://api.test.com", {
        headers: {
          Authorization: `Bearer ${mockTmdbToken}`,
          Accept: "application/json",
        },
      });
    });

    it("should return failure on HTTP error", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await (movieService as any).fetchTMDB(
        "https://api.test.com"
      );

      expect(result).toEqual({
        success: false,
        data: null,
      });
    });

    it("should return failure on TMDB error response", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, status_code: 401 }),
      });

      const result = await (movieService as any).fetchTMDB(
        "https://api.test.com"
      );

      expect(result).toEqual({
        success: false,
        data: null,
      });
    });
  });
});
