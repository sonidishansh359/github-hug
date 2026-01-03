import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserOrder } from '@/contexts/UserDataContext';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as UserOrder | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-success" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-6">
          Your order has been confirmed and is being prepared.
        </p>

        {order && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm text-foreground">#{order.id.slice(-8)}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                Estimated delivery: 30-45 mins
              </span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-sm text-foreground">{order.deliveryAddress}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/user/tracking')} className="gap-2">
            Track Your Order
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/user/dashboard')}>
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
