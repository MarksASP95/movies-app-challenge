import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const useRatingStars = (
  rating: number,
  size = 10,
  interactive = false,
  onChange = (rating: number) => rating,
  filledColor = "var(--color-primary-500)"
) => {
  const [currentRating, setCurrentRating] = useState<number>(Math.ceil(rating));
  const [savedRating, setSavedRating] = useState<number>(currentRating);

  const filledStars = useMemo(() => {
    return Array(currentRating)
      .fill(null)
      .map((_, i) => getRatingStar(true, `filled-${i}`, i));
  }, [currentRating]);
  const emptyStars = useMemo(() => {
    return Array(10 - currentRating)
      .fill(null)
      .map((_, i) =>
        getRatingStar(false, `empty-${i}`, i + filledStars.length)
      );
  }, [currentRating]);

  /**
   * had to put this dumb effects here because currentRating was
   * always being initialized with 0 and I have no idea why
   */
  useEffect(() => {
    setCurrentRating(Math.ceil(rating));
  }, [rating]);
  useEffect(() => {
    setSavedRating(currentRating);
  }, []);

  function handleStarHover(index: number) {
    setCurrentRating(index + 1);
  }

  function handleStarMouseLeave() {
    // setCurrentRating(rating);
  }

  function handleStarClick(index: number) {
    setCurrentRating(index + 1);
    setSavedRating(index + 1);
    onChange(index + 1);
  }

  function getRatingStar(filled: Boolean, key: string, index: number) {
    return (
      <Star
        onMouseEnter={() => interactive && handleStarHover(index)}
        onMouseLeave={() => interactive && handleStarMouseLeave()}
        onClick={() => interactive && handleStarClick(index)}
        key={key}
        className="mr-2"
        style={{ stroke: filled ? filledColor : "white" }}
        size={size}
      />
    );
  }

  return {
    starsElements: [...filledStars, ...emptyStars],
  };
};
