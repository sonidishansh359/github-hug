import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/contexts/UserDataContext';

const orderSteps = [
  { status: 'placed', label: 'Order Placed', icon: '📝' },
  { status: 'confirmed', label: 'Confirmed', icon: '✅' },
  { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴' },
  { status: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function OrderTracking() {
  const { activeOrder, updateOrderStatus } = useUserData();
  const [currentStep, setCurrentStep] = useState(0);

  // Simulate order progress
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;

    const stepIndex = orderSteps.findIndex(s => s.status === activeOrder.status);
    setCurrentStep(stepIndex >= 0 ? stepIndex : 0);

    // Auto-progress simulation
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < orderSteps.length - 1) {
          const nextStatus = orderSteps[prev + 1].status as any;
          updateOrderStatus(activeOrder.id, nextStatus);
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [activeOrder?.id]);

  if (!activeOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No active orders</h2>
          <p className="text-muted-foreground">Place an order to track it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8 px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Track Order</h1>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 lg:h-80 bg-secondary rounded-xl overflow-hidden mb-6"
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095919355!2d-74.00425878428698!3d40.71278794379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a1656b26c9f%3A0xa63c9ea5b807cdf7!2sOne%20World%20Trade%20Center!5e0!3m2!1sen!2sus!4v1640000000000!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Navigation className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">
              {activeOrder.deliveryPartner?.name || 'Driver'} is on the way
            </p>
            <p className="text-xs text-muted-foreground">Arriving in ~15 mins</p>
          </div>
        </div>
      </motion.div>

      {/* Order Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-foreground">Order Status</h2>
          <span className="text-sm text-muted-foreground">#{activeOrder.id.slice(-8)}</span>
        </div>

        <div className="relative">
          {orderSteps.map((step, index) => (
            <div key={step.status} className="flex items-start gap-4 mb-6 last:mb-0">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  index <= currentStep ? 'bg-primary' : 'bg-secondary'
                }`}>
                  {step.icon}
                </div>
                {index < orderSteps.length - 1 && (
                  <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
              <div className="pt-2">
                <p className={`font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Delivery Partner */}
      {activeOrder.deliveryPartner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">🚴</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{activeOrder.deliveryPartner.name}</p>
            <p className="text-sm text-muted-foreground">Delivery Partner</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
