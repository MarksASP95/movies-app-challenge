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
}

export interface CreateFavoriteInput {
  tmdbId: number;
}