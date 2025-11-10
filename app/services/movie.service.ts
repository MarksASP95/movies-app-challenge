import { PaginatedResult, ServiceResult } from "@/app/models/general.model";
import { db } from "@/lib/db";
import { favoritesTable, moviesTable } from "@/lib/db/schema";
import { and, asc, count, eq } from "drizzle-orm";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import z from "zod";
import { MOVIE_GENRES } from "../constants/movie.const";
import {
  FavoriteData,
  FavoriteMovieUpdateData,
  Movie,
  MovieDB,
  RecommendedMovie,
} from "../models/movie.model";
import { TMDB } from "../models/tmdb.model";
import { ObjectUtils } from "../utilts/object.util";

export class MovieService {
  private readonly TMDB_READ_ACCESS_TOKEN = process.env
    .TMDB_READ_ACCESS_TOKEN as string;
  private readonly TMDB_DOMAIN = "https://api.themoviedb.org/3/";
  private readonly FAVORITES_PAGE_SIZE = 8;

  get genresById() {
    return ObjectUtils.buildRecord(MOVIE_GENRES, "id");
  }

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

      if ((data as TMDB.ErrorResponse).success === false) {
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

  private serializeMovieFromResult(rawMovie: TMDB.SearchResult): Movie {
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
      title: rawMovie.title,
      tmdbId: rawMovie.id,
      genre: rawMovie.genre_ids[0]
        ? this.genresById[rawMovie.genre_ids[0]].name
        : null,
    };
  }

  private serializeMovieFromDetails(rawMovie: TMDB.MovieDetails): Movie {
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
      title: rawMovie.title,
      tmdbId: rawMovie.id,
      genre: rawMovie.genres[0]?.name || null,
    };
  }

  private movieFromDB(dbMovie: MovieDB): Movie {
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
      genre: dbMovie.genre,
    };
  }

  async getTrending(): Promise<ServiceResult<{ movies: Movie[] }>> {
    const url = `${this.TMDB_DOMAIN}trending/movie/day`;

    const result = await this.fetchTMDB<TMDB.SearchResponse>(url);

    if (!result.success) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: {
        movies: result.data!.results.map(
          this.serializeMovieFromResult.bind(this)
        ),
      },
    };
  }

  async search(
    value: string,
    page: number
  ): Promise<ServiceResult<PaginatedResult<Movie>>> {
    const url = `${this.TMDB_DOMAIN}search/movie?query=${value}&page=${page}`;
    const result = await this.fetchTMDB<TMDB.SearchResponse>(url);

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
        results: result.data!.results.map(
          this.serializeMovieFromResult.bind(this)
        ),
        totalResults: result.data!.total_results,
      },
    };
  }

  async getByIdAPI(tmdb: number): Promise<ServiceResult<Movie>> {
    const url = `${this.TMDB_DOMAIN}movie/${tmdb}`;
    const result = await this.fetchTMDB<TMDB.MovieDetails>(url);

    if (!result.success) {
      return {
        success: false,
        data: null,
      };
    }

    return {
      success: true,
      data: this.serializeMovieFromDetails(result.data!),
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
          let savedMovie: MovieDB | undefined;
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
          return {
            success: false,
            data: null,
          };
        }
      })
      .catch((err) => {
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

  private async getTotalUserFavorites(auth0Id: string): Promise<number> {
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userAuth0Id, auth0Id),
          eq(favoritesTable.isActive, true)
        )
      );

    return totalCount;
  }

  async getUserFavoritesPaginated(
    auth0Id: string,
    page: number
  ): Promise<ServiceResult<PaginatedResult<Movie>>> {
    const moviesJoinPromise = db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userAuth0Id, auth0Id),
          eq(favoritesTable.isActive, true)
        )
      )
      .innerJoin(moviesTable, eq(favoritesTable.movieId, moviesTable.id))
      .orderBy(asc(favoritesTable.movieId)) // order by is mandatory
      .limit(this.FAVORITES_PAGE_SIZE)
      .offset(this.FAVORITES_PAGE_SIZE * (page - 1));

    const countPromise = this.getTotalUserFavorites(auth0Id);

    const [moviesJoin, count] = await Promise.all([
      moviesJoinPromise,
      countPromise,
    ]);

    const movies: Movie[] = moviesJoin.map(({ movies }) => {
      return this.movieFromDB(movies);
    });

    return {
      data: {
        page,
        pageSize: this.FAVORITES_PAGE_SIZE,
        results: movies,
        totalResults: count,
      },
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

  async getRecommendations(
    tmdbId: number
  ): Promise<ServiceResult<RecommendedMovie[]>> {
    const url = `${this.TMDB_DOMAIN}movie/${tmdbId}`;

    const result = await this.fetchTMDB<TMDB.SearchResult>(url);

    if (!result.success) {
      return {
        success: false,
        data: null,
      };
    }

    const movieTitle = result.data!.title;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const z_MovieRecommentations = z.object({
      recommendations: z.array(
        z.object({
          genre: z.string(),
          title: z.string(),
          year: z.number(),
        })
      ),
    });

    const response = await client.responses.parse({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You are a movie recommendation assistant. You will give 5 similiar movies based on the movie that the user gives you",
        },
        {
          role: "user",
          content: `Recommend movies similar to ${movieTitle}`,
        },
      ],
      text: {
        format: zodTextFormat(z_MovieRecommentations, "recommendations"),
      },
    });

    const recommendations = response.output_parsed?.recommendations || null;
    return {
      data: recommendations,
      success: !!recommendations,
    };
  }
}
