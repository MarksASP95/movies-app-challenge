import { favoritesTable, moviesTable } from "@/lib/db/schema";

export interface Movie {
  title: string;
  description: string;
  posterUrl: string | null;
  releaseDate: {
    year: number;
    day: number;
    month: number;
  } | null;
  rating: number;
  tmdbId: number;
  favoriteId?: number;
}

export interface CreateFavoriteInput {
  tmdbId: number;
}

export type FavoriteData = typeof favoritesTable.$inferSelect;

export interface UpdateFavoriteInput {
  userTake?: string;
  userRating?: number;
}

export type FavoriteMovieUpdateData = Pick<
  typeof favoritesTable.$inferInsert,
  "userRating" | "userTake"
>;
