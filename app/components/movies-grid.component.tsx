"use client";
import { Toast, createToaster } from "@skeletonlabs/skeleton-react";
import React, { useMemo, useState } from "react";
import { FavoriteData, Movie } from "../models/movie.model";
import MovieCard from "./movie-card/movie-card.component";
import MovieModal from "./movie-modal/movie-modal.component";
import PageSpinner from "./page-spinner/page-spinner.component";

export default function MoviesGrid({
  movies,
  type,
  keyBuilder,
  favoritesIds = [],
}: {
  movies: Movie[];
  type: "favorites" | "trending" | "search";
  favoritesIds?: number[];
  keyBuilder?: (movie: Movie) => string;
}) {
  const toaster = createToaster({ placement: "bottom" });

  const [selectedMovie, setSelectedMovie] = useState<{
    movie: Movie;
    favoriteData?: FavoriteData;
    isFavorite: boolean;
  } | null>(null);

  const [removedIdsMap, setRemovedIdsMap] = useState<Record<number, true>>([]);
  const [showSpinner, setShowSpinner] = useState(false);

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

  const handleMovieSelected = async (movie: Movie, isFavorite: boolean) => {
    let favoriteData: FavoriteData | undefined;
    if (isFavorite && type === "favorites") {
      setShowSpinner(true);
      const result = await fetch(`/api/favorites/${movie.tmdbId}`).then((res) =>
        res.json()
      );

      if (!result.data) {
        toaster.error({ title: "Could not find favorite data for this movie" });
        setShowSpinner(false);
        return;
      }
      favoriteData = result.data;
    }

    setSelectedMovie({
      movie,
      isFavorite,
      favoriteData,
    });
    setShowSpinner(false);
  };

  const moviesElements: React.ReactElement[] = useMemo(() => {
    return movies
      .filter((movie) => !removedIdsMap[movie.tmdbId])
      .map((movie) => (
        <MovieCard
          onSelected={handleMovieSelected}
          alreadyFavorite={type === "favorites" || favoritesMap[movie.tmdbId]}
          enableRemoveFromFavorites={type === "favorites"}
          canFavorite={type !== "favorites"}
          onFavorited={() => {
            toaster.success({
              title: "Added to Favorites",
            });
          }}
          onUnfavorited={(tmdbId: number) => {
            toaster.success({
              title: "Removed from Favorites",
            });
            if (type !== "favorites") return;
            addToRemovedIds(tmdbId);
          }}
          key={keyBuilder ? keyBuilder(movie) : movie.tmdbId}
          movie={movie}
        />
      ));
  }, [movies, removedIdsMap, toaster]);

  const handleFavoriteSubmit = (data: {
    userTake: string;
    userRating?: number;
  }) => {
    setShowSpinner(true);

    fetch(`/api/favorites/${selectedMovie!.movie.tmdbId}`, {
      method: "put",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((resBody) => {
        if (!resBody.success) {
          return toaster.error({ title: "Could not update movie" });
        }
        setSelectedMovie(null);
      })
      .finally(() => {
        setShowSpinner(false);
      });
  };

  return (
    <>
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

        {selectedMovie && (
          <MovieModal
            isOpen={!!selectedMovie}
            movie={selectedMovie.movie}
            favoriteData={selectedMovie.favoriteData}
            handleClose={() => setSelectedMovie(null)}
            onFavoriteSave={handleFavoriteSubmit}
          />
        )}
      </div>
      <PageSpinner visible={showSpinner} />
    </>
  );
}
