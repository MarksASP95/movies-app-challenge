"use client";

import { useMovieCardElements } from "@/app/hooks/useMovieCardElements";
import { useRatingStars } from "@/app/hooks/useRatingStars";
import { MouseEvent, useMemo, useState } from "react";
import { Movie } from "../../models/movie.model";
import "./movie-card.component.scss";

export default function MovieCard({
  movie,
  alreadyFavorite,
  canFavorite = false,
  enableRemoveFromFavorites = false,
  onFavorited = (tmdbId: number) => tmdbId,
  onUnfavorited = (tmdbId: number) => tmdbId,
  onSelected = () => null,
  onRecommendationsClick,
}: {
  movie: Movie;
  alreadyFavorite: boolean;
  canFavorite: boolean;
  onFavorited?: (tmdbId: number) => any;
  onUnfavorited?: (tmdbId: number) => any;
  enableRemoveFromFavorites?: boolean;
  onSelected?: (movie: Movie, isFavorite: boolean) => any;
  onRecommendationsClick: (movie: Movie) => any;
}) {
  const { dateStr, toggleFavorite, favoritting, madeFavorite } =
    useMovieCardElements(movie, alreadyFavorite, onFavorited, onUnfavorited);

  const { starsElements } = useRatingStars(movie.rating);

  const [modalOpen, setModalOpen] = useState(false);

  const handleOptionClick = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    action: Function
  ) => {
    e.stopPropagation();
    action();
  };

  const favoriteEmoji = useMemo(() => {
    if (favoritting) return "⌛";
    if (enableRemoveFromFavorites) return "❌";
    if (madeFavorite) return "❤️";

    return "🤍";
  }, [favoritting, madeFavorite]);

  return (
    <>
      <div
        onClick={() => onSelected(movie, madeFavorite)}
        key={movie.tmdbId}
        className="movie-card card preset-outlined-primary-500 border-[1px] border-primary-800 card-hover divide-surface-200-800 block divide-y overflow-hidden relative"
      >
        <div className="card-options p-2 flex">
          <div
            onClick={(e) => handleOptionClick(e, toggleFavorite)}
            className="card-options__item mr-4"
          >
            {favoriteEmoji}
          </div>
          <div className="card-options__item mr-4">👁️</div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onRecommendationsClick(movie);
            }}
            className="card-options__item"
          >
            🪄
          </div>
        </div>
        {/* Header */}
        <header>
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              className="aspect-[21/9] w-full object-cover object-top"
              alt={movie.title}
            />
          ) : (
            <div className="aspect-[21/9] w-full object-cover object-top flex justify-center items-center">
              <p className="text-center">No picture</p>
            </div>
          )}
        </header>
        {/* Article */}
        <article className="space-y-4 p-4">
          <div>
            <div className="flex">{starsElements}</div>
            <h3 className="h3">{movie.title}</h3>
          </div>
          <p style={{ height: 168 }} className="opacity-60 overflow-hidden">
            {movie.description}
          </p>
        </article>
        {/* Footer */}
        <footer className="flex items-center justify-end gap-4 p-4">
          {/* <small className="opacity-60">By Alex</small> */}
          <small className="opacity-60">{dateStr}</small>
        </footer>
      </div>
    </>
  );
}
