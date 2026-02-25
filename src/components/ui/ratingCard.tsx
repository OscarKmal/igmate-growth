import { motion } from 'motion/react';
import { Star } from "lucide-react"
import { useState } from "react"
import { t } from '~utils/commonFunction'

interface RatingCardProps {
  title?: string
  description?: string
  maxRating?: number
  initialRating?: number
  onRatingChange?: (rating: number) => void
}

export const RatingCard: React.FC<RatingCardProps> = ({
  title = t('tab_unfollow_result_rating_title'),
  description = t('tab_unfollow_result_rating_download_question'),
  maxRating = 5,
  initialRating = 0,
  onRatingChange
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [rating, setRating] = useState(initialRating)

  const handleClick = (value: number) => {
    setRating(value)
    onRatingChange?.(value)
  }

  const handleHover = (value: number) => {
    setHoverRating(value)
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 opacity-30 blur-2xl rounded-3xl"></div>
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 p-6 rounded-2xl border-2 border-amber-200 shadow-xl">
        <div className="text-center mb-3">
          <h3 className="text-xl mb-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        <div className="flex items-center justify-center gap-3 py-2">
          {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
            <motion.button
              key={star}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleHover(star)}
              onMouseLeave={() => handleHover(0)}
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="focus:outline-none cursor-pointer transition-all"
            >
              <Star
                className={`h-12 w-12 transition-all duration-200 ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-500 drop-shadow-lg"
                    : "fill-gray-200 text-gray-300"
                }`}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
