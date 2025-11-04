import { MONTHS_TEXTS } from "@/lib/constants/date.const";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Movie } from "../models/movie.model";

export const useMovieCardElements = (
  { rating, releaseDate, tmdbId }: Movie,
  alreadyFavorite: boolean,
  onFavorited = (tmdbId: number) => tmdbId,
  onUnfavorited = (tmdbId: number) => tmdbId
) => {
  const useMovieCardData = Math.ceil(rating);

  function getRatingStar(filled: Boolean, key: string) {
    return (
      <Star
        key={key}
        className="mr-2"
        style={{ stroke: filled ? "var(--color-primary-500)" : "white" }}
        size={10}
      />
    );
  }

  const [favoritting, setFavoritting] = useState(false);
  const [madeFavorite, setMadeFavorite] = useState(alreadyFavorite);

  const filledStars = useMemo(() => {
    return Array(useMovieCardData)
      .fill(null)
      .map((_, i) => getRatingStar(true, `filled-${i}`));
  }, [rating]);
  const emptyStars = useMemo(() => {
    return Array(10 - useMovieCardData)
      .fill(null)
      .map((_, i) => getRatingStar(false, `empty-${i}`));
  }, [rating]);

  const dateStr = useMemo(() => {
    return releaseDate
      ? `${MONTHS_TEXTS[releaseDate?.month - 1]} ${releaseDate.day}, ${
          releaseDate.year
        }`
      : "unkown date";
  }, [releaseDate]);

  function toggleFavorite() {
    if (favoritting) return;
    const setActive = !madeFavorite;

    setFavoritting(true);
    fetch("/api/favorites", {
      method: madeFavorite ? "delete" : "post",
      body: JSON.stringify({
        tmdbId,
      }),
    })
      .then((res) => res.json())
      .then((resBody) => {
        if (resBody.success) {
          setActive ? onFavorited(resBody.data) : onUnfavorited(resBody.data);
          setMadeFavorite((current) => !current);
        }
      })
      .finally(() => {
        setFavoritting(false);
      });
  }

  return {
    starsElements: [...filledStars, ...emptyStars],
    dateStr,
    favoritting,
    toggleFavorite,
    madeFavorite,
  };
};
