"use client";
import { Dialog, Toast, createToaster } from "@skeletonlabs/skeleton-react";
import React, { useMemo, useState } from "react";
import { FavoriteData, Movie, RecommendedMovie } from "../models/movie.model";
import MovieCard from "./movie-card/movie-card.component";
import MovieModalContent from "./movie-modal/movie-modal-content.component";
import PageSpinner from "./page-spinner/page-spinner.component";
import RecommendationsModal from "./recommendations-modal/recommendations-modal.component";

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

  const [recommendations, setRecommendations] = useState<{
    sourceTitle: string;
    list: RecommendedMovie[];
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
    if (isFavorite) {
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

  async function handleRecommendationsClick(movie: Movie) {
    setShowSpinner(true);
    const response = await fetch(`/api/recommendations/${movie.tmdbId}`).then(
      (res) => res.json()
    );

    if (!response.success) {
      toaster.error({ title: "Could not load recommendations" });
      setShowSpinner(false);
      return;
    }

    setRecommendations({
      list: response.data,
      sourceTitle: movie.title,
    });

    setShowSpinner(false);
  }

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
          onRecommendationsClick={handleRecommendationsClick}
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

        {recommendations?.list && (
          <RecommendationsModal
            isOpen={!!recommendations}
            recommendations={recommendations.list}
            handleClose={() => setRecommendations(null)}
            movieTitle={recommendations?.sourceTitle}
          />
        )}

        <Dialog
          open={!!selectedMovie}
          onEscapeKeyDown={() => setSelectedMovie(null)}
        >
          {selectedMovie && (
            <MovieModalContent
              movie={selectedMovie.movie}
              favoriteData={selectedMovie.favoriteData}
              handleClose={() => setSelectedMovie(null)}
              onFavoriteSave={handleFavoriteSubmit}
            />
          )}
        </Dialog>
      </div>
      <PageSpinner visible={showSpinner} />
    </>
  );
}
