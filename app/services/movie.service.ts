import { db } from "@/lib/db";
import { favoritesTable, moviesTable } from "@/lib/db/schema";
import { PaginatedResult } from "@/lib/models/general.model";
import { and, count, eq } from "drizzle-orm";
import {
  FavoriteData,
  FavoriteMovieUpdateData,
  Movie,
} from "../models/movie.model";

interface ServiceResult<T = any> {
  success: boolean;
  data: T | null;
}

interface TMDBErrorResponse {
  success?: boolean;
  status_code?: number;
}

interface TMDBSearchResult {
  id: number;
  original_title: string;
  poster_path: string;
  release_date?: string;
  title: string;
  overview: string;
  vote_average: number;
}

interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

export class MovieService {
  private readonly TMDB_READ_ACCESS_TOKEN = process.env
    .TMDB_READ_ACCESS_TOKEN as string;
  private readonly TMDB_DOMAIN = "https://api.themoviedb.org/3/";

  private async fetchTMDB<T>(url: string): Promise<ServiceResult<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.TMDB_READ_ACCESS_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return {
          success: false,
          data: null,
        };
      }

      const data = await response.json();

      if ((data as TMDBErrorResponse).success === false) {
        return {
          success: false,
          data: null,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
      };
    }
  }

  private movieFromJson(rawMovie: TMDBSearchResult): Movie {
    let releaseDate = null;
    if (rawMovie.release_date) {
      const [year, month, day] = rawMovie.release_date
        .split("-")
        .map((num) => parseInt(num));

      releaseDate = {
        year,
        month,
        day,
      };
    }
    return {
      description: rawMovie.overview,
      posterUrl: rawMovie.poster_path
        ? `https://image.tmdb.org/t/p/original${rawMovie.poster_path}`
        : null,
      rating: rawMovie.vote_average,
      releaseDate,
      title: rawMovie.original_title,
      tmdbId: rawMovie.id,
    };
  }

  private movieFromDB(dbMovie: typeof moviesTable.$inferSelect): Movie {
    return {
      description: dbMovie.description,
      posterUrl: dbMovie.posterUrl,
      rating: dbMovie.rating || 0,
      releaseDate: dbMovie.year
        ? {
            day: dbMovie.day!,
            month: dbMovie.month!,
            year: dbMovie.year!,
          }
        : null,
      title: dbMovie.title,
      tmdbId: dbMovie.tmdbId,
    };
  }

  async getTrending(): Promise<ServiceResult<{ movies: Movie[] }>> {
    const url = `${this.TMDB_DOMAIN}trending/movie/day`;

    const result = await this.fetchTMDB<TMDBSearchResponse>(url);

    if (!result.success) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: {
        movies: result.data!.results.map(this.movieFromJson),
      },
    };
  }

  async search(
    value: string,
    page: number
  ): Promise<ServiceResult<PaginatedResult<Movie>>> {
    const url = `${this.TMDB_DOMAIN}search/movie?query=${value}&page=1`;
    const result = await this.fetchTMDB<TMDBSearchResponse>(url);

    if (!result.success) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: {
        page,
        pageSize: 20,
        results: result.data!.results.map(this.movieFromJson),
        totalResults: result.data!.total_results,
      },
    };
  }

  async getByIdAPI(tmdb: number): Promise<ServiceResult<Movie>> {
    const url = `${this.TMDB_DOMAIN}movie/${tmdb}`;
    const result = await this.fetchTMDB<TMDBSearchResult>(url);

    if (!result.success) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: this.movieFromJson(result.data!),
    };
  }

  getByIdSaved(tmdbId: number): Promise<ServiceResult<Movie>> {
    return db
      .select()
      .from(moviesTable)
      .where(eq(moviesTable.tmdbId, tmdbId))
      .then((rows) => {
        const dbMovie = rows[0];
        const movie: Movie | null = dbMovie ? this.movieFromDB(dbMovie) : null;
        return {
          data: movie || null,
          success: !!movie,
        };
      })
      .catch(() => {
        return {
          data: null,
          success: false,
        };
      });
  }

  saveFavorite(auth0Id: string, movie: Movie): Promise<ServiceResult<number>> {
    return db
      .transaction(async (tx) => {
        try {
          let savedMovie: typeof moviesTable.$inferSelect | undefined;
          const [existingMovie] = await tx
            .select()
            .from(moviesTable)
            .where(eq(moviesTable.tmdbId, movie.tmdbId));

          savedMovie = existingMovie;

          if (!savedMovie) {
            const [newSavedMovie] = await tx
              .insert(moviesTable)
              .values({
                description: movie.description,
                title: movie.title,
                tmdbId: movie.tmdbId,
                day: movie.releaseDate?.day,
                month: movie.releaseDate?.month,
                year: movie.releaseDate?.year,
                posterUrl: movie.posterUrl,
                rating: movie.rating,
              })
              .onConflictDoNothing()
              .returning();

            savedMovie = newSavedMovie;
          }

          const alreadyFavoriteCounts = await db
            .select({ count: count() })
            .from(favoritesTable)
            .where(
              and(
                eq(favoritesTable.userAuth0Id, auth0Id),
                eq(favoritesTable.movieId, savedMovie.id)
              )
            );

          if (alreadyFavoriteCounts[0]?.count) {
            return this.toggleFavorite(auth0Id, movie.tmdbId, true);
          }

          await tx.insert(favoritesTable).values({
            movieId: savedMovie.id,
            userAuth0Id: auth0Id,
          });

          return {
            success: true,
            data: savedMovie.tmdbId,
          };
        } catch (error) {
          console.log("error was", error);
          // tx.rollback();
          return {
            success: false,
            data: null,
          };
        }
      })
      .catch((err) => {
        console.log("ERROR", err);
        return {
          data: null,
          success: false,
        };
      });
  }

  async getUserFavoritesIds(auth0Id: string): Promise<ServiceResult<number[]>> {
    const moviesJoin = await db
      .select({
        tmdbId: moviesTable.tmdbId,
      })
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userAuth0Id, auth0Id),
          eq(favoritesTable.isActive, true)
        )
      )
      .innerJoin(moviesTable, eq(favoritesTable.movieId, moviesTable.id));

    const ids = moviesJoin.map(({ tmdbId }) => {
      return tmdbId;
    });

    return {
      data: ids,
      success: true,
    };
  }

  async getUserFavorites(auth0Id: string): Promise<ServiceResult<Movie[]>> {
    const moviesJoin = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userAuth0Id, auth0Id),
          eq(favoritesTable.isActive, true)
        )
      )
      .innerJoin(moviesTable, eq(favoritesTable.movieId, moviesTable.id));

    const movies: Movie[] = moviesJoin.map(({ movies }) => {
      return this.movieFromDB(movies);
    });

    return {
      data: movies,
      success: true,
    };
  }

  async getFavorite(
    auth0Id: string,
    tmdbId: number
  ): Promise<ServiceResult<FavoriteData>> {
    const moviesJoin = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userAuth0Id, auth0Id),
          eq(favoritesTable.isActive, true),
          eq(moviesTable.tmdbId, tmdbId)
        )
      )
      .innerJoin(moviesTable, eq(favoritesTable.movieId, moviesTable.id));

    const favoriteData = moviesJoin[0]?.favorites || null;

    return {
      data: favoriteData,
      success: !!favoriteData,
    };
  }

  async toggleFavorite(
    auth0Id: string,
    tmdbId: number,
    setActive: boolean
  ): Promise<ServiceResult<number>> {
    await db
      .update(favoritesTable)
      .set({
        isActive: setActive,
      })
      .from(moviesTable)
      .where(
        and(
          eq(moviesTable.id, favoritesTable.movieId),
          eq(moviesTable.tmdbId, tmdbId),
          eq(favoritesTable.userAuth0Id, auth0Id)
        )
      );

    return {
      success: true,
      data: tmdbId,
    };
  }

  async updateFavorite(
    auth0Id: string,
    tmdbId: number,
    data: FavoriteMovieUpdateData
  ): Promise<ServiceResult<number>> {
    await db
      .update(favoritesTable)
      .set(data)
      .from(moviesTable)
      .where(
        and(
          eq(moviesTable.id, favoritesTable.movieId),
          eq(moviesTable.tmdbId, tmdbId),
          eq(favoritesTable.userAuth0Id, auth0Id)
        )
      );

    return {
      success: true,
      data: tmdbId,
    };
  }
}
