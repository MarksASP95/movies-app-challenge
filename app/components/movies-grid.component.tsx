"use client";
import React, { useMemo, useState } from "react";
import { Movie } from "../models/movie.model";
import MovieCard from "./movie-card/movie-card.component";
import { Toast, createToaster } from "@skeletonlabs/skeleton-react";
import { ObjectUtils } from "../utilts/object.util";

export default function MoviesGrid({
  movies,
  type,
  keyBuilder,
  favoritesIds = [],
}: {
  movies: Movie[];
  type: "favorites" | "trending";
  favoritesIds?: number[];
  keyBuilder?: (movie: Movie) => string;
}) {
  const toaster = createToaster({ placement: "bottom" });

  const [removedIdsMap, setRemovedIdsMap] = useState<Record<number, true>>([]);

  function addToRemovedIds(id: number) {
    return setRemovedIdsMap((current) => {
      return {
        ...current,
        [id]: true,
      };
    });
  }

  const favoritesMap = useMemo(() => {
    if (type === "favorites") return {};
    const record: Record<number, true> = {};
    for (const id of favoritesIds) {
      record[id] = true;
    }
    return record;
  }, [favoritesIds]);

  const moviesElements: React.ReactElement[] = movies
    .filter((movie) => !removedIdsMap[movie.tmdbId])
    .map((movie) => (
      <MovieCard
        alreadyFavorite={type === "favorites" || favoritesMap[movie.tmdbId]}
        enableRemoveFromFavorites={type === "favorites"}
        canFavorite={type !== "favorites"}
        onFavorited={(tmdbId: number) => {
          toaster.success({
            title: "Added to Favorites",
          });
        }}
        onUnfavorited={(tmdbId: number) => {
          addToRemovedIds(tmdbId);
          toaster.success({
            title: "Removed from Favorites",
          });
        }}
        key={keyBuilder ? keyBuilder(movie) : movie.tmdbId}
        movie={movie}
      />
    ));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {moviesElements}

      <Toast.Group toaster={toaster}>
        {(toast) => (
          <Toast toast={toast} key={toast.id}>
            <Toast.Message>
              <Toast.Title>{toast.title}</Toast.Title>
              <Toast.Description>{toast.description}</Toast.Description>
            </Toast.Message>
            <Toast.CloseTrigger />
          </Toast>
        )}
      </Toast.Group>
    </div>
  );
}
