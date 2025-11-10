export namespace TMDB {
  export interface ErrorResponse {
    success?: boolean;
    status_code?: number;
  }
  export interface SearchResult {
    id: number;
    original_title: string;
    poster_path: string;
    release_date?: string;
    title: string;
    overview: string;
    vote_average: number;
    genre_ids: string[];
  }
  export interface MovieDetails {
    id: number;
    original_title: string;
    poster_path: string;
    release_date?: string;
    title: string;
    overview: string;
    vote_average: number;
    genres: Genre[];
  }
  export interface SearchResponse {
    page: number;
    results: SearchResult[];
    total_pages: number;
    total_results: number;
  }
  export interface Genre {
    id: number;
    name: string;
  }
}
