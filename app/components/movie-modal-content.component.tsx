import { useRatingStars } from "@/app/hooks/useRatingStars";
import { FavoriteData, Movie } from "@/app/models/movie.model";
import { Dialog, Portal } from "@skeletonlabs/skeleton-react";
import React, { useRef, useState } from "react";
import PageSpinner from "./page-spinner.component";

export default function MovieModalContent({
  handleClose,
  movie,
  favoriteData,
  onFavoriteSave,
}: {
  movie: Movie;
  favoriteData?: FavoriteData;
  handleClose?: () => void;
  onFavoriteSave?: (data: { userTake: string; userRating?: number }) => any;
}) {
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);

  const { starsElements: originalRatingStars } = useRatingStars(
    movie.rating || 0,
    30
  );
  const { starsElements: userRatingStars } = useRatingStars(
    favoriteData?.userRating || 0,
    30,
    true,
    handleUserRatingChange,
    "var(--color-warning-500)"
  );

  const myTakeRef = useRef<HTMLTextAreaElement>(null);

  const [showSpinner, setShowSpinner] = useState(false);
  const [userRating, setUserRating] = useState(favoriteData?.userRating || 0);

  function submit() {
    const userTake = (myTakeRef.current!.value || "").trim() || "";
    onFavoriteSave &&
      onFavoriteSave({ userTake, userRating: userRating || undefined });
  }

  function handleUserRatingChange(rating: number) {
    setUserRating(rating);
  }

  return (
    <>
      <Dialog.Trigger
        ref={dialogTriggerRef}
        className="btn preset-filled hidden"
      >
        Trigger
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-surface-50-950/50" />
        <Dialog.Positioner className="fixed inset-0 z-50 flex justify-center items-center">
          {movie && (
            <Dialog.Content className="card bg-surface-100-900 w-2xl p-4 space-y-2 shadow-xl">
              <Dialog.Title className="text-2xl font-bold">
                {movie.title}
              </Dialog.Title>
              {movie.posterUrl && (
                <img
                  className="w-full h-50 object-cover object-center rounded-sm"
                  src={movie.posterUrl}
                  alt={movie.title}
                />
              )}
              <div className="flex">{originalRatingStars}</div>
              <p>{movie.genre}</p>
              <Dialog.Description>{movie.description}</Dialog.Description>

              {favoriteData && (
                <>
                  <br />
                  <hr />
                  <br />
                  <p className="text-lg text-center">My rating</p>
                  <div className="flex justify-center">{userRatingStars}</div>

                  <br />
                  <p className="text-lg text-center">My take</p>
                  <textarea
                    defaultValue={favoriteData.userTake || ""}
                    ref={myTakeRef}
                    className="textarea"
                    rows={6}
                    placeholder=""
                  ></textarea>
                </>
              )}

              <div className="flex justify-center">
                {favoriteData && (
                  <button
                    onClick={submit}
                    type="button"
                    className="btn preset-tonal mx-3"
                  >
                    Save
                  </button>
                )}
                <Dialog.CloseTrigger
                  onClick={() => handleClose && handleClose()}
                  className="btn preset-tonal mx-2"
                >
                  Close
                </Dialog.CloseTrigger>
              </div>
            </Dialog.Content>
          )}
        </Dialog.Positioner>
      </Portal>
      <PageSpinner visible={showSpinner} />
    </>
  );
}
