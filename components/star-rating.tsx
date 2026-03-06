"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export function StarRating({ value, onChange, max = 5, size = "md", disabled = false }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  }

  const labels = ["Very Low", "Low", "Average", "High", "Very High"]

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onChange(star)}
            disabled={disabled}
            className={cn(
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-sm",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110",
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-200",
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-slate-300 hover:text-amber-300",
              )}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-sm font-medium text-amber-600">
          {labels[value - 1]} ({value}/5)
        </span>
      )}
    </div>
  )
}
