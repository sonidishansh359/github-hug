import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MapPin, Navigation, Phone, CheckCircle, Clock, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeliveryLayout } from '@/components/delivery/DeliveryLayout';
import { useDeliveryData } from '@/contexts/DeliveryDataContext';
import { cn } from '@/lib/utils';
import { Order } from '@/types/auth';

const statusSteps = [
  { status: 'picked_up', label: 'Picked Up', icon: Package },
  { status: 'on_the_way', label: 'On the Way', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function DeliveryTracking() {
  const { activeOrder, updateOrderStatus, currentLocation } = useDeliveryData();
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    if (activeOrder) {
      const interval = setInterval(() => {
        setSimulatedProgress(prev => (prev < 100 ? prev + Math.random() * 2 : 100));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeOrder]);

  const getCurrentStepIndex = () => {
    if (!activeOrder) return -1;
    return statusSteps.findIndex(step => step.status === activeOrder.status);
  };

  const handleStatusUpdate = (status: Order['status']) => {
    if (activeOrder) {
      updateOrderStatus(activeOrder.id, status);
    }
  };

  const getNextStatus = (): Order['status'] | null => {
    if (!activeOrder) return null;
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < statusSteps.length - 1) {
      return statusSteps[currentIndex + 1].status as Order['status'];
    }
    return null;
  };

  const getNextStatusLabel = () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return null;
    return statusSteps.find(s => s.status === nextStatus)?.label;
  };

  return (
    <DeliveryLayout>
      <Helmet>
        <title>Live Tracking | FoodSwift Delivery</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track your active delivery in real-time
          </p>
        </div>

        {!activeOrder ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                  <Navigation className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">No Active Delivery</h3>
                <p className="text-muted-foreground mt-1">
                  Accept an order to start tracking
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Route
                    </span>
                    <Badge variant="outline" className="font-normal">
                      {activeOrder.distance}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  {/* Map Placeholder */}
                  <div className="relative h-[400px] bg-muted">
                    {/* Simulated Map */}
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50">
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304605!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1708012345678!5m2!1sen!2s`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale-[20%]"
                      />
                    </div>

                    {/* Current Location Marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
                      >
                        <Navigation className="w-6 h-6 text-primary-foreground" />
                      </motion.div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 rounded-full bg-primary/30 animate-ping" />
                      </div>
                    </div>

                    {/* Progress Bar Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${simulatedProgress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium">{Math.round(simulatedProgress)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Coordinates Display */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Position</span>
                      <span className="font-mono">
                        {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details & Controls */}
            <div className="space-y-6">
              {/* Status Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getCurrentStepIndex();
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      const isPending = index > currentIndex;

                      return (
                        <div key={step.status} className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            isCompleted && "bg-green-500 text-white",
                            isCurrent && "bg-primary text-primary-foreground",
                            isPending && "bg-muted text-muted-foreground"
                          )}>
                            <step.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "font-medium",
                              isPending && "text-muted-foreground"
                            )}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-muted-foreground">In progress</p>
                            )}
                            {isCompleted && (
                              <p className="text-xs text-green-500">Completed</p>
                            )}
                          </div>
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {getNextStatus() && (
                    <Button
                      className="w-full mt-6"
                      onClick={() => handleStatusUpdate(getNextStatus()!)}
                    >
                      Mark as {getNextStatusLabel()}
                    </Button>
                  )}

                  {activeOrder.status === 'delivered' && (
                    <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-950 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-green-700 dark:text-green-300">
                        Delivery Completed!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                      You earned ₹{activeOrder.estimatedEarning.toFixed(2)}
                                                    </p>                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{activeOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{activeOrder.deliveryAddress}</p>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${activeOrder.customerPhone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Customer
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-muted-foreground">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                      </span>                      </div>
                    ))}
                    <div className="flex justify-between font-medium pt-3 border-t border-border">
                      <span>Total</span>
                      <span>₹{activeOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-500 font-medium">
                      <span>Your Earnings</span>
                      <span>+₹{activeOrder.estimatedEarning.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
}