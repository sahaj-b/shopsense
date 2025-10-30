import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  maxStars?: number;
}

export function StarRating({ value, onChange, maxStars = 5 }: StarRatingProps) {
  return (
    <div className="flex">
      {Array.from({ length: maxStars }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            className="active:scale-95 p-2 group"
            onClick={() => onChange(starValue === value ? 0 : starValue)}
          >
            <Star
              className={`w-5 h-5 transition-colors group-hover:text-yellow-200/40 group-hover:fill-yellow-200/40 group-hover:scale-105 ${
                starValue <= value
                  ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-200 dark:text-yellow-200"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
