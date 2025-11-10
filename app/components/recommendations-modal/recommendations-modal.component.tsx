import { RecommendedMovie } from "@/app/models/movie.model";
import { Dialog, Portal } from "@skeletonlabs/skeleton-react";
import Link from "next/link";
import { useMemo, useRef } from "react";
import "./recommendations-modal.component.scss";

export default function RecommendationsModal({
  isOpen,
  handleClose,
  movieTitle,
  recommendations,
}: {
  isOpen: boolean;
  movieTitle: string;
  handleClose?: () => void;
  recommendations: RecommendedMovie[];
}) {
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);

  const recommendationsElements = useMemo(() => {
    return recommendations.map((rec, i) => {
      return (
        <Link
          href={`/search?s=${encodeURIComponent(rec.title)}`}
          onClick={handleClose}
          key={i}
          className="recommended-movie-container"
        >
          <div className="h-full text-center card p-4 preset-outlined-primary-500">
            <p className="text-xl">{rec.title}</p>
            <p>{rec.genre}</p>
            <p>{rec.year}</p>
          </div>
        </Link>
      );
    });
  }, [recommendations]);

  return (
    <>
      <Dialog open={isOpen} onEscapeKeyDown={handleClose}>
        <Dialog.Trigger
          ref={dialogTriggerRef}
          className="btn preset-filled hidden"
        >
          Trigger
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-surface-50-950/50" />
          <Dialog.Positioner className="fixed inset-0 z-50 flex justify-center items-center">
            <Dialog.Content className="card bg-surface-100-900 w-2xl p-4 space-y-2 shadow-xl">
              <Dialog.Title className="text-2xl font-bold">
                Movies like "{movieTitle}"
              </Dialog.Title>

              <div className="grid grid-cols-3 gap-2">
                {recommendationsElements}
              </div>

              <div className="flex justify-center">
                <Dialog.CloseTrigger
                  onClick={() => handleClose && handleClose()}
                  className="btn preset-tonal mx-2"
                >
                  Close
                </Dialog.CloseTrigger>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog>
    </>
  );
}
