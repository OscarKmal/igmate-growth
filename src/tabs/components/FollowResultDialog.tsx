import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~components/ui/dialog';
import { Button } from '~components/ui/button';
import { TrendingUp, Star, Heart, MessageSquare, Clock, Users, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { RatingCard } from '~components/ui/ratingCard';

interface FollowResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  downloadResult: {
    count: number;
    filtered?: number;
    time: string;
  };
  rating: number;
  hasRated: boolean;
  showRatingCard: boolean;
  jumpChromeRating: boolean;
  onRatingClick: (rating: number) => void;
  onRateOnChromeStore: (rating: number) => void;
  onOpenFeedback: () => void;
  handleClickNewAction: () => void;
}

export function FollowResultDialog({
  open,
  onOpenChange,
  downloadResult,
  rating,
  hasRated,
  showRatingCard,
  jumpChromeRating,
  onRatingClick,
  onRateOnChromeStore,
  onOpenFeedback,
  handleClickNewAction
}: FollowResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!hasRated ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <motion.div 
                  className="h-16 w-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <TrendingUp className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <DialogTitle className="text-center text-2xl">Follow Complete!</DialogTitle>
              <DialogDescription className="text-center">
                Your follow task has been completed
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Followed
                    </span>
                    {typeof downloadResult.filtered === "number" && (
                      <span className="text-xs text-gray-500">
                        (Filtered {downloadResult.filtered.toLocaleString()})
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {downloadResult.count.toLocaleString()}
                  </p>
                </div>
              
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">
                      time-consuming
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {downloadResult.time}
                  </p>
                </div>
              </div>

              {showRatingCard && (
                <>
                  <RatingCard
                    description="How satisfied are you with this follow task?"
                    onRatingChange={onRatingClick}
                  />
                  <Button 
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600" 
                    size="lg"
                    onClick={()=>{
						onOpenChange(false);
						handleClickNewAction();
					}}
                  >
					<Play className="h-5 w-5 mr-2" />
					New Action
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Dialog</DialogTitle>
              <DialogDescription className="sr-only">Dialog</DialogDescription>
			  <div className="flex items-center justify-center mb-4">
                <motion.div 
                  className="h-20 w-20 bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.7, bounce: 0.5 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", duration: 0.5 }}
                  >
                    <Heart className="h-10 w-10 text-white fill-white" />
                  </motion.div>
                </motion.div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
			  <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h3 className="text-3xl mb-3 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
                  Thank You!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your feedback means the world to us
                </p>

                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + star * 0.1, type: "spring" }}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'fill-gray-200 text-gray-300'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200"
                >
                  <p className="text-sm text-gray-700">
					We're constantly improving our tools to serve you better. Your {rating}-star rating helps us understand what we're doing right!
                  </p>
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600" 
                  size="lg"
                  onClick={()=>{
						onOpenChange(false);
						handleClickNewAction();
					}}
                >
					<Play className="h-5 w-5 mr-2" />
					Start New Action
                </Button>
				
				{rating === 5 ? (
                  jumpChromeRating&&(
					  <Button 
						className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg" 
						size="lg"
						onClick={()=>{
							onOpenChange(false);
							onRateOnChromeStore(rating);
						}}
					  >
						<Star className="h-4 w-4 mr-2" />
						Rate Us on Chrome Store
					  </Button>
				  )
                ) : (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg" 
                    size="lg"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenFeedback();
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
					Share Your Feedback
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
