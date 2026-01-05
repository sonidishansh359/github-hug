import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { UserOrder } from '@/contexts/UserDataContext';

interface OrderFeedbackModalProps {
  order: UserOrder;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (orderId: string) => void;
}

export function OrderFeedbackModal({ order, isOpen, onClose, onSubmitSuccess }: OrderFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Thank you for your feedback!",
      description: "Your feedback helps us improve our service.",
    });
    
    setIsSubmitting(false);
    onSubmitSuccess(order.id);
    onClose();
    
    // Reset state
    setRating(0);
    setFeedback('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setRating(0);
      setFeedback('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Share Your Feedback</h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Order Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-6">
              <img
                src={order.restaurantImage}
                alt={order.restaurantName}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-foreground">{order.restaurantName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.items.length} items • ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                Rate your experience
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={isSubmitting}
                    className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional comments (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience..."
                disabled={isSubmitting}
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}