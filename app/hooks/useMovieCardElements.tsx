import { MONTHS_TEXTS } from "@/lib/constants/date.const";
import { useMemo, useState } from "react";
import { Movie } from "../models/movie.model";

export const useMovieCardElements = (
  { releaseDate, tmdbId }: Movie,
  alreadyFavorite: boolean,
  onFavorited = (tmdbId: number) => tmdbId,
  onUnfavorited = (tmdbId: number) => tmdbId
) => {
  const [favoritting, setFavoritting] = useState(false);
  const [madeFavorite, setMadeFavorite] = useState(alreadyFavorite);

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
    const path = madeFavorite ? `/api/favorites/${tmdbId}` : "/api/favorites/";
    fetch(path, {
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
    dateStr,
    favoritting,
    toggleFavorite,
    madeFavorite,
  };
};
