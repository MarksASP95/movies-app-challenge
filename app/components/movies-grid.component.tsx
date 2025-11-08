"use client";
import {
  Dialog,
  Portal,
  Toast,
  createToaster,
} from "@skeletonlabs/skeleton-react";
import React, { useMemo, useRef, useState } from "react";
import { useRatingStars } from "../hooks/useRatingStars";
import { FavoriteData, Movie } from "../models/movie.model";
import MovieCard from "./movie-card/movie-card.component";
import PageSpinner from "./page-spinner/page-spinner.component";

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

  const dialogTriggerRef = useRef<HTMLButtonElement>(null);

  const myTakeRef = useRef<HTMLTextAreaElement>(null);

  const [selectedMovie, setSelectedMovie] = useState<{
    movie: Movie;
    favoriteData?: FavoriteData;
    isFavorite: boolean;
  } | null>(null);

  const [removedIdsMap, setRemovedIdsMap] = useState<Record<number, true>>([]);
  const [submittingMovieModal, setSubmittingMovieModal] = useState(false);
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

  const handleClose = () => {
    if (submittingMovieModal) return;
    setSelectedMovie(null);
  };

  const { starsElements: originalRatingStars } = useRatingStars(
    selectedMovie?.movie.rating || 0,
    30
  );
  const { starsElements: userRatingStars } = useRatingStars(
    selectedMovie?.favoriteData?.userRating || 0,
    30,
    true,
    undefined,
    "var(--color-warning-500)"
  );

  const moviesElements: React.ReactElement[] = useMemo(() => {
    return movies
      .filter((movie) => !removedIdsMap[movie.tmdbId])
      .map((movie) => (
        <MovieCard
          onSelected={handleMovieSelected}
          alreadyFavorite={type === "favorites" || favoritesMap[movie.tmdbId]}
          enableRemoveFromFavorites={type === "favorites"}
          canFavorite={type !== "favorites"}
          onFavorited={(tmdbId: number) => {
            toaster.success({
              title: "Added to Favorites",
            });
          }}
          onUnfavorited={(tmdbId: number) => {
            if (type !== "favorites") return;
            addToRemovedIds(tmdbId);
            toaster.success({
              title: "Removed from Favorites",
            });
          }}
          key={keyBuilder ? keyBuilder(movie) : movie.tmdbId}
          movie={movie}
        />
      ));
  }, [movies]);

  const handleFavoriteSubmit = () => {
    setShowSpinner(true);
    const take = (myTakeRef.current!.value || "").trim() || undefined;
    const rating = 6;
    const body = {} as any;
    if (take) body.take = take;
    if (rating) body.rating = rating;

    fetch(`/api/favorites/${selectedMovie!.movie.tmdbId}`, {
      method: "put",
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((resBody) => {
        if (resBody.success) {
          setSelectedMovie(null);
        }
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

        <Dialog open={!!selectedMovie} onEscapeKeyDown={handleClose}>
          <Dialog.Trigger
            ref={dialogTriggerRef}
            className="btn preset-filled hidden"
          >
            Trigger
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-surface-50-950/50" />
            <Dialog.Positioner className="fixed inset-0 z-50 flex justify-center items-center">
              {selectedMovie && (
                <Dialog.Content className="card bg-surface-100-900 w-2xl p-4 space-y-2 shadow-xl">
                  <Dialog.Title className="text-2xl font-bold">
                    {selectedMovie.movie.title}
                  </Dialog.Title>
                  {selectedMovie.movie.posterUrl && (
                    <img
                      className="w-full h-50 object-cover object-center rounded-sm"
                      src={selectedMovie.movie.posterUrl}
                      alt={selectedMovie.movie.title}
                    />
                  )}
                  <div className="flex">{originalRatingStars}</div>
                  <Dialog.Description>
                    {selectedMovie.movie.description}
                  </Dialog.Description>

                  {selectedMovie?.favoriteData && (
                    <>
                      <br />
                      <hr />
                      <br />
                      <p className="text-lg text-center">My rating</p>
                      <div className="flex justify-center">
                        {userRatingStars}
                      </div>

                      <br />
                      <p className="text-lg text-center">My take</p>
                      <textarea
                        defaultValue={
                          selectedMovie?.favoriteData.userTake || ""
                        }
                        ref={myTakeRef}
                        className="textarea"
                        rows={6}
                        placeholder=""
                      ></textarea>
                    </>
                  )}

                  <div className="flex justify-center">
                    {selectedMovie?.favoriteData && (
                      <button
                        onClick={handleFavoriteSubmit}
                        type="button"
                        className="btn preset-tonal mx-3"
                      >
                        Save
                      </button>
                    )}
                    <Dialog.CloseTrigger
                      onClick={handleClose}
                      className="btn preset-tonal mx-2"
                    >
                      Close
                    </Dialog.CloseTrigger>
                  </div>
                </Dialog.Content>
              )}
            </Dialog.Positioner>
          </Portal>
        </Dialog>
      </div>
      <PageSpinner visible={showSpinner} />
    </>
  );
}
