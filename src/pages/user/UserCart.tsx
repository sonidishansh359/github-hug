import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  MapPin,
  CreditCard,
  Wallet,
  Banknote,
  ChevronRight,
  ShoppingBag,
  Home,
  Building,
  Target,
  Navigation,
  X,
  Loader2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'upi' | 'card' | 'cod';

const paymentMethods = [
  { id: 'upi' as PaymentMethod, name: 'UPI', icon: Wallet, description: 'Pay using UPI apps' },
  { id: 'card' as PaymentMethod, name: 'Card', icon: CreditCard, description: 'Credit or Debit card' },
  { id: 'cod' as PaymentMethod, name: 'Cash on Delivery', icon: Banknote, description: 'Pay when delivered' },
];

// Sample saved addresses (same as dashboard)
const savedAddresses = [
  { id: 1, type: 'home', name: 'Home', address: '123 Main Street, Apt 4B, Food City, FC 12345', isDefault: true },
  { id: 2, type: 'work', name: 'Office', address: '456 Business Ave, Corporate Park', isDefault: false },
  { id: 3, type: 'other', name: 'Gym', address: '789 Fitness Road, Sports Complex', isDefault: false },
];

// Get icon for address type
const getAddressIcon = (type) => {
  switch(type) {
    case 'home': return <Home className="w-5 h-5" />;
    case 'work': return <Building className="w-5 h-5" />;
    case 'current': return <Target className="w-5 h-5" />;
    default: return <MapPin className="w-5 h-5" />;
  }
};

export default function UserCart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, updateCartQuantity, removeFromCart, placeOrder } = useUserData();
  
  // Address state
  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    // Try to get from localStorage first
    const saved = localStorage.getItem('currentAddress');
    return saved ? JSON.parse(saved) : savedAddresses[0];
  });
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userAddresses, setUserAddresses] = useState(() => {
    const saved = localStorage.getItem('userAddresses');
    return saved ? JSON.parse(saved) : savedAddresses;
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  
  // Payment and order state
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 25 ? 0 : 3.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  // Get user's live location
  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);
    setLiveLocation(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch address');
          }
          
          const data = await response.json();
          
          let addressString = '';
          if (data.address) {
            const addr = data.address;
            if (addr.road) addressString += addr.road + ', ';
            if (addr.suburb) addressString += addr.suburb + ', ';
            if (addr.city || addr.town || addr.village) {
              addressString += (addr.city || addr.town || addr.village) + ', ';
            }
            if (addr.state) addressString += addr.state;
            
            // If we couldn't construct a detailed address, use display name
            if (addressString.trim().length < 5) {
              addressString = data.display_name.split(',')[0] + ', ' + (addr.city || addr.town || 'Current Location');
            }
          } else {
            addressString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          }

          const liveLocationObj = {
            id: 'live-location',
            type: 'current',
            name: 'Current Location',
            address: addressString,
            isDefault: false,
            coordinates: { latitude, longitude },
            isNew: true
          };
          
          setLiveLocation(liveLocationObj);
          setDeliveryAddress(liveLocationObj);
          setIsGettingLocation(false);
          setShowAddressModal(false);
          
          // Save to localStorage
          localStorage.setItem('currentAddress', JSON.stringify(liveLocationObj));
          
          // Show success toast
          toast({
            title: 'Location Updated',
            description: 'Using your current location for delivery',
          });
          
        } catch (error) {
          console.error('Geocoding error:', error);
          setLocationError('Could not get address details for your location');
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Address management functions
  const handleAddressSelect = (address) => {
    setDeliveryAddress(address);
    setShowAddressModal(false);
    
    // Save to localStorage
    localStorage.setItem('currentAddress', JSON.stringify(address));
    
    toast({
      title: 'Address Updated',
      description: `Delivering to ${address.name}`,
    });
  };

  const handleSetDefault = (addressId) => {
    const updatedAddresses = userAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setUserAddresses(updatedAddresses);
    
    // Save to localStorage
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    
    if (deliveryAddress.id === addressId) {
      const updatedAddress = { ...deliveryAddress, isDefault: true };
      setDeliveryAddress(updatedAddress);
      localStorage.setItem('currentAddress', JSON.stringify(updatedAddress));
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart first',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const order = placeOrder(deliveryAddress.address, selectedPayment);
    
    setIsProcessing(false);
    
    toast({
      title: 'Order placed successfully!',
      description: `Order #${order.id.slice(-6)} is being prepared`,
    });
    
    navigate('/user/checkout-success', { 
      state: { 
        order,
        deliveryAddress: deliveryAddress.address,
        estimatedDelivery: '30-40 minutes'
      } 
    });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious food to get started</p>
          <Button onClick={() => navigate('/user/restaurants')}>
            Browse Restaurants
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8">
      {/* Address Change Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Select Delivery Address</h2>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Location Section */}
              <div className="mb-6">
                <h3 className="font-medium text-foreground mb-3">Current Location</h3>
                <div className="space-y-3">
                  {liveLocation ? (
                    <div
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        deliveryAddress.id === 'live-location'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-border hover:border-green-300 hover:bg-secondary'
                      }`}
                      onClick={() => handleAddressSelect(liveLocation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            deliveryAddress.id === 'live-location' 
                              ? 'bg-green-500 text-white animate-pulse' 
                              : 'bg-green-100 text-green-600 dark:bg-green-900'
                          }`}>
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {liveLocation.name}
                              </span>
                              {liveLocation.isNew && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{liveLocation.address}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-xs text-green-600 font-medium">
                                📍 Live location
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                Updated just now
                              </span>
                            </div>
                          </div>
                        </div>
                        {deliveryAddress.id === 'live-location' && (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={getLiveLocation}
                      disabled={isGettingLocation}
                      className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                        isGettingLocation 
                          ? 'border-border bg-secondary cursor-not-allowed' 
                          : 'border-green-200 hover:border-green-300 hover:bg-secondary hover:border-solid'
                      }`}
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                          <div className="text-center">
                            <p className="font-medium text-foreground">Getting your location...</p>
                            <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                            <Navigation className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-foreground">Use Current Location</p>
                            <p className="text-xs text-muted-foreground mt-1">Tap to detect your live location</p>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                  
                  {locationError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400">{locationError}</p>
                      </div>
                      <button
                        onClick={() => setLocationError(null)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium mt-2"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-foreground mb-2">Saved Addresses</h3>
                {userAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      deliveryAddress.id === address.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-secondary'
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          deliveryAddress.id === address.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {getAddressIcon(address.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{address.name}</span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{address.address}</p>
                        </div>
                      </div>
                      {deliveryAddress.id === address.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Set as Default
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all duration-200"
                >
                  Deliver to {deliveryAddress.name}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-16 bg-card/95 backdrop-blur-md border-b border-border z-30">
        <div className="px-4 lg:px-8 py-4 flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Your Cart</h1>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Cart Items & Delivery */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  {cart[0]?.restaurantName || 'Your Items'}
                </h2>
              </div>
              <div className="divide-y divide-border">
                {cart.map(item => (
                  <div key={item.menuItemId} className="p-4 flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.menuItemId, item.quantity - 1)}
                          className="w-7 h-7 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.menuItemId, item.quantity + 1)}
                          className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">Delivery Address</h2>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-sm text-primary font-medium"
                >
                  Change
                </button>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                deliveryAddress.type === 'current' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' 
                  : 'bg-secondary'
              }`}>
                <div className={`p-2 rounded-lg ${
                  deliveryAddress.type === 'current' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {getAddressIcon(deliveryAddress.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{deliveryAddress.name}</p>
                    {deliveryAddress.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Default
                      </span>
                    )}
                    {deliveryAddress.type === 'current' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full animate-pulse">
                        📍 Live
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{deliveryAddress.address}</p>
                  
                  {/* Delivery Time Estimate */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Estimated delivery:</span>
                    <span className="font-medium text-foreground">30-40 minutes</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <h2 className="font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-3 rounded-xl border transition-colors',
                      selectedPayment === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-secondary/50'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      selectedPayment === method.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    )}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2',
                      selectedPayment === method.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )}>
                      {selectedPayment === method.id && (
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded-xl p-6 sticky top-36">
              <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 dark:text-green-500' : 'text-foreground'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="text-foreground">₹{tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-4" />
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 25 && (
                <div className="mt-4 p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Add <span className="font-bold text-primary">₹{(25 - subtotal).toFixed(2)}</span> more for free delivery
                  </p>
                </div>
              )}

              <Button
                className="w-full mt-6 h-12"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Place Order • ₹${total.toFixed(2)}`
                )}
              </Button>

              {/* Order Protection */}
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  ✓ Your order is protected with secure payment
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ✓ Delivery to: {deliveryAddress.address.split(',')[0]}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
