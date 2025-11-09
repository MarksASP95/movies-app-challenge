import { Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export const useRatingStars = (
  rating: number,
  size = 10,
  interactive = false,
  onChange?: (rating: number) => void,
  filledColor = "var(--color-primary-500)"
) => {
  const [currentRating, setCurrentRating] = useState<number>(Math.ceil(rating));
  const [savedRating, setSavedRating] = useState<number>(currentRating);

  const starRef = useRef<SVGSVGElement>(null);

  const filledStars = useMemo(() => {
    return Array(currentRating)
      .fill(null)
      .map((_, i) => getRatingStar(true, `filled-${i}`, i));
  }, [currentRating, savedRating]);
  const emptyStars = useMemo(() => {
    return Array(10 - currentRating)
      .fill(null)
      .map((_, i) =>
        getRatingStar(false, `empty-${i}`, i + filledStars.length)
      );
  }, [currentRating, savedRating]);

  /**
   * had to put this dumb effect here because currentRating was
   * always being initialized with 0 and I have no idea why
   */
  useEffect(() => {
    setCurrentRating(Math.ceil(rating));
  }, [rating]);
  useEffect(() => {
    onChange && onChange(savedRating);
  }, [savedRating]);

  function handleStarMouseLeave() {
    setCurrentRating(savedRating || rating);
  }

  function handleStarHover(index: number) {
    setCurrentRating(index + 1);
  }

  function handleStarClick(index: number) {
    setSavedRating(index + 1);
  }

  function getRatingStar(filled: boolean, key: string, index: number) {
    return (
      <Star
        ref={starRef}
        onMouseEnter={() => interactive && handleStarHover(index)}
        onMouseLeave={() => interactive && handleStarMouseLeave()}
        onClick={() => interactive && handleStarClick(index)}
        key={key}
        className={interactive ? `pr-2` : "mr-2"}
        style={{
          stroke: filled ? filledColor : "white",
          fill:
            interactive && savedRating === currentRating && filled
              ? filledColor
              : undefined,
        }}
        size={size}
      />
    );
  }

  return {
    starsElements: [...filledStars, ...emptyStars],
  };
};
