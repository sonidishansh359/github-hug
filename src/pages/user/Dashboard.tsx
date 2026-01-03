import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Clock, Star, TrendingUp, ChevronRight, Utensils, 
  Navigation, Bell, User, X, Filter, Home, Building, 
  Zap, Truck, Shield, DollarSign, Sparkles, Award, Heart, ChevronDown, Check,
  Plus, Loader2, Target, AlertCircle,
  Settings, LogOut, Package, History, HelpCircle, Gift, ShieldCheck, CreditCard,
  Mail, Phone, Map, CheckCircle, AlertTriangle, Info, Percent, ShoppingBag,
  Truck as TruckIcon, CookingPot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

const categories = [
  { id: 1, name: 'Pizza', icon: '🍕', color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
  { id: 2, name: 'Burgers', icon: '🍔', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200' },
  { id: 3, name: 'Sushi', icon: '🍣', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
  { id: 4, name: 'Indian', icon: '🍛', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
  { id: 5, name: 'Desserts', icon: '🍰', color: 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200' },
  { id: 6, name: 'Drinks', icon: '🥤', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  { id: 7, name: 'Italian', icon: '🍝', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
  { id: 8, name: 'Chinese', icon: '🥡', color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
  { id: 9, name: 'Mexican', icon: '🌮', color: 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200' },
  { id: 10, name: 'Vegan', icon: '🥗', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  { id: 11, name: 'Breakfast', icon: '🍳', color: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' },
  { id: 12, name: 'Seafood', icon: '🦞', color: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200' },
];

// Advanced filter options
const filterOptions = [
  { id: 'fastDelivery', name: 'Fast Delivery', icon: Zap, description: 'Delivered in 30 min or less' },
  { id: 'freeDelivery', name: 'Free Delivery', icon: Truck, description: 'No delivery fee' },
  { id: 'highRating', name: 'High Rating', icon: Star, description: '4.0+ rating' },
  { id: 'discounts', name: 'Great Offers', icon: DollarSign, description: 'Discounts & deals' },
  { id: 'topRated', name: 'Top Rated', icon: Award, description: 'Most popular' },
  { id: 'new', name: 'New Arrivals', icon: Sparkles, description: 'Recently added' },
  { id: 'healthy', name: 'Healthy Options', icon: Heart, description: 'Healthy choices' },
  { id: 'premium', name: 'Premium', icon: Shield, description: 'Premium restaurants' },
];

// Sample delivery addresses
const savedAddresses = [
  { id: 1, type: 'home', name: 'Home', address: '123 Main Street, Food City', isDefault: true },
  { id: 2, type: 'work', name: 'Office', address: '456 Business Ave, Corporate Park', isDefault: false },
  { id: 3, type: 'other', name: 'Gym', address: '789 Fitness Road, Sports Complex', isDefault: false },
  { id: 4, type: 'other', name: "Mom's House", address: '321 Family Lane, Suburbia', isDefault: false },
];

// Profile menu items
const profileMenuItems = [
  { id: 'profile', name: 'My Profile', icon: User, description: 'View & edit your profile' },
  { id: 'orders', name: 'My Orders', icon: Package, description: 'Order history & tracking' },
  { id: 'addresses', name: 'Saved Addresses', icon: Map, description: 'Manage delivery locations' },
  { id: 'payments', name: 'Payment Methods', icon: CreditCard, description: 'Cards & payment options' },
  { id: 'offers', name: 'Offers & Rewards', icon: Gift, description: 'Discounts & cashback' },
  { id: 'safety', name: 'Safety Center', icon: ShieldCheck, description: 'Account security' },
  { id: 'help', name: 'Help & Support', icon: HelpCircle, description: 'FAQs & contact support' },
  { id: 'settings', name: 'Settings', icon: Settings, description: 'App preferences' },
];

// Sample notifications data
const initialNotifications = [
  {
    id: 1,
    type: 'order',
    title: 'Order Confirmed!',
    message: 'Your order #ORD1234 has been confirmed and is being prepared.',
    time: 'Just now',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-600',
    read: false,
    link: '/user/tracking'
  },
  {
    id: 2,
    type: 'offer',
    title: 'Special Offer!',
    message: 'Get 40% off on all Italian restaurants. Valid for today only.',
    time: '1 hour ago',
    icon: Percent,
    color: 'bg-orange-100 text-orange-600',
    read: false,
    link: '/user/restaurants?category=Italian'
  },
  {
    id: 3,
    type: 'delivery',
    title: 'Order Out for Delivery',
    message: 'Your order from Burger Palace will arrive in 15-20 minutes.',
    time: '2 hours ago',
    icon: TruckIcon,
    color: 'bg-blue-100 text-blue-600',
    read: true,
    link: '/user/tracking'
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Cart Reminder',
    message: 'You have items in your cart. Complete your order now!',
    time: '5 hours ago',
    icon: ShoppingBag,
    color: 'bg-purple-100 text-purple-600',
    read: true,
    link: '/user/cart'
  },
  {
    id: 5,
    type: 'restaurant',
    title: 'New Restaurant Alert',
    message: 'Sushi Palace is now available in your area. Try their special rolls!',
    time: '1 day ago',
    icon: CookingPot,
    color: 'bg-red-100 text-red-600',
    read: true,
    link: '/user/restaurant/15'
  },
  {
    id: 6,
    type: 'payment',
    title: 'Payment Successful',
    message: 'Payment of ₹24.99 for order #ORD1234 has been processed.',
    time: '2 days ago',
    icon: CreditCard,
    color: 'bg-green-100 text-green-600',
    read: true,
    link: '/user/orders'
  },
  {
    id: 7,
    type: 'safety',
    title: 'Security Update',
    message: 'We have enhanced our security features to protect your account.',
    time: '3 days ago',
    icon: ShieldCheck,
    color: 'bg-blue-100 text-blue-600',
    read: true,
    link: '/user/safety'
  }
];

export default function UserDashboard() {
  const { restaurants, activeOrder } = useUserData();
  const { user, logout } = useAuth();
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [filteredCategories, setFilteredCategories] = useState(categories.slice(0, 6));
  
  // State for delivery address management
  const [currentAddress, setCurrentAddress] = useState(savedAddresses[0]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userAddresses, setUserAddresses] = useState(savedAddresses);
  const [newAddress, setNewAddress] = useState('');
  const [addressName, setAddressName] = useState('');
  const [addressType, setAddressType] = useState('home');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  
  // State for live location
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  
  // State for filter dropdown
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // State for profile dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // State for notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread notifications count
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Simulate new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance to add a new notification
      if (Math.random() < 0.2 && notifications.length < 15) {
        const newNotificationTypes = [
          {
            type: 'offer',
            title: 'Flash Sale!',
            message: 'Limited time offer: 50% off on all desserts. Order now!',
            icon: Percent,
            color: 'bg-pink-100 text-pink-600'
          },
          {
            type: 'order',
            title: 'Order Update',
            message: 'Your recent order has been rated 5 stars. Thank you!',
            icon: Star,
            color: 'bg-yellow-100 text-yellow-600'
          },
          {
            type: 'delivery',
            title: 'Fast Delivery Available',
            message: 'Get your food delivered in under 20 minutes with Express Delivery.',
            icon: Clock,
            color: 'bg-green-100 text-green-600'
          }
        ];
        
        const randomType = newNotificationTypes[Math.floor(Math.random() * newNotificationTypes.length)];
        const newNotification = {
          id: Date.now(),
          ...randomType,
          time: 'Just now',
          read: false,
          link: '/user'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [notifications.length]);

  // Enhanced filter restaurants function
  useEffect(() => {
    let result = [...restaurants];
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query) ||
        restaurant.description?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(restaurant => 
        restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        restaurant.categories?.includes(selectedCategory)
      );
    }
    
    // Apply advanced filters
    activeFilters.forEach(filter => {
      switch(filter) {
        case 'fastDelivery':
          result = result.filter(r => r.deliveryTime <= 30);
          break;
        case 'freeDelivery':
          result = result.filter(r => r.deliveryFee === 0 || r.deliveryFee === undefined);
          break;
        case 'highRating':
          result = result.filter(r => r.rating >= 4.0);
          break;
        case 'discounts':
          result = result.filter(r => r.discount || r.hasOffers);
          break;
        case 'topRated':
          result = result.filter(r => r.rating >= 4.5);
          break;
        case 'new':
          result = result.filter(r => r.isNew);
          break;
        case 'healthy':
          result = result.filter(r => r.healthyOptions);
          break;
        case 'premium':
          result = result.filter(r => r.isPremium);
          break;
      }
    });
    
    setFilteredRestaurants(result);
  }, [searchQuery, selectedCategory, activeFilters, restaurants]);

  // Toggle showing all categories
  const toggleShowAllCategories = () => {
    setShowAllCategories(!showAllCategories);
    setFilteredCategories(showAllCategories ? categories.slice(0, 6) : categories);
  };

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(selectedCategory === categoryName ? 'All' : categoryName);
  };

  // Handle filter toggle
  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setActiveFilters([]);
  };

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
            coordinates: { latitude, longitude }
          };
          
          setLiveLocation(liveLocationObj);
          setCurrentAddress(liveLocationObj);
          setIsGettingLocation(false);
          
          // Show success message
          setTimeout(() => {
            setLiveLocation(prev => ({ ...prev, isNew: false }));
          }, 3000);
          
          // Add notification for location update
          addNotification({
            type: 'location',
            title: 'Location Updated',
            message: `Your delivery location has been updated to: ${addressString}`,
            icon: MapPin,
            color: 'bg-green-100 text-green-600'
          });
          
        } catch (error) {
          console.error('Geocoding error:', error);
          setLocationError('Could not get address details for your location');
          setIsGettingLocation(false);
          
          // Add error notification
          addNotification({
            type: 'error',
            title: 'Location Error',
            message: 'Failed to get your current location. Please try again.',
            icon: AlertTriangle,
            color: 'bg-red-100 text-red-600'
          });
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
        
        // Add error notification
        addNotification({
          type: 'error',
          title: 'Location Permission',
          message: 'Please enable location permissions to use this feature.',
          icon: AlertCircle,
          color: 'bg-orange-100 text-orange-600'
        });
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
    setCurrentAddress(address);
    setShowAddressModal(false);
    
    // Add notification for address change
    addNotification({
      type: 'location',
      title: 'Delivery Address Updated',
      message: `Now delivering to: ${address.name}`,
      icon: Home,
      color: 'bg-blue-100 text-blue-600'
    });
  };

  const handleAddNewAddress = () => {
    if (!newAddress.trim() || !addressName.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    const newAddressObj = {
      id: userAddresses.length + 1,
      type: addressType,
      name: addressName,
      address: newAddress,
      isDefault: false
    };
    
    setUserAddresses([...userAddresses, newAddressObj]);
    setCurrentAddress(newAddressObj);
    setNewAddress('');
    setAddressName('');
    setIsAddingNewAddress(false);
    
    // Add notification for new address
    addNotification({
      type: 'address',
      title: 'New Address Saved',
      message: `Added "${addressName}" to your saved addresses`,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    });
  };

  const handleSetDefault = (addressId) => {
    const updatedAddresses = userAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setUserAddresses(updatedAddresses);
    setCurrentAddress(updatedAddresses.find(addr => addr.id === addressId));
    
    // Add notification for default address change
    const address = updatedAddresses.find(addr => addr.id === addressId);
    addNotification({
      type: 'address',
      title: 'Default Address Updated',
      message: `Set "${address.name}" as your default delivery address`,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600'
    });
  };

  const handleDeleteAddress = (addressId) => {
    if (userAddresses.length <= 1) {
      alert('You must have at least one address saved');
      return;
    }
    
    const addressToDelete = userAddresses.find(addr => addr.id === addressId);
    const updatedAddresses = userAddresses.filter(addr => addr.id !== addressId);
    setUserAddresses(updatedAddresses);
    
    if (currentAddress.id === addressId) {
      const defaultAddr = updatedAddresses.find(addr => addr.isDefault) || updatedAddresses[0];
      setCurrentAddress(defaultAddr);
    }
    
    // Add notification for address deletion
    addNotification({
      type: 'address',
      title: 'Address Removed',
      message: `Removed "${addressToDelete.name}" from saved addresses`,
      icon: Info,
      color: 'bg-gray-100 text-gray-600'
    });
  };

  // Notification functions
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      time: 'Just now',
      read: false,
      link: notification.link || '/user'
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get visible restaurants for different sections
  const popularRestaurants = filteredRestaurants
    .filter(r => r.rating >= 4.0)
    .slice(0, 6);
  
  const allRestaurants = filteredRestaurants;

  // Get icon for address type
  const getAddressIcon = (type) => {
    switch(type) {
      case 'home': return <Home className="w-5 h-5" />;
      case 'work': return <Building className="w-5 h-5" />;
      case 'current': return <Target className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8 bg-white">
      {/* Address Change Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Select Delivery Address</h2>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Location Section */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Current Location</h3>
                <div className="space-y-3">
                  {liveLocation ? (
                    <div
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        currentAddress.id === 'live-location'
                          ? 'border-green-500 bg-green-50'
                          : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                      onClick={() => handleAddressSelect(liveLocation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            currentAddress.id === 'live-location' 
                              ? 'bg-green-500 text-white animate-pulse' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {liveLocation.name}
                              </span>
                              {liveLocation.isNew && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{liveLocation.address}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-xs text-green-600 font-medium">
                                📍 Live location
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                Updated just now
                              </span>
                            </div>
                          </div>
                        </div>
                        {currentAddress.id === 'live-location' && (
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
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                          : 'border-green-200 hover:border-green-300 hover:bg-green-50 hover:border-solid'
                      }`}
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                          <div className="text-center">
                            <p className="font-medium text-gray-900">Getting your location...</p>
                            <p className="text-xs text-gray-500 mt-1">Please wait</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-green-100 rounded-full">
                            <Navigation className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">Use Current Location</p>
                            <p className="text-xs text-gray-500 mt-1">Tap to detect your live location</p>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                  
                  {locationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{locationError}</p>
                      </div>
                      <button
                        onClick={() => setLocationError(null)}
                        className="text-xs text-red-600 hover:text-red-800 mt-2 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Saved Addresses</h3>
                {userAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      currentAddress.id === address.id
                        ? 'border-[#FF7A00] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          currentAddress.id === address.id ? 'bg-[#FF7A00] text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {getAddressIcon(address.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{address.name}</span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                        </div>
                      </div>
                      {currentAddress.id === address.id && (
                        <div className="w-5 h-5 rounded-full bg-[#FF7A00] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Set as Default
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address Section */}
              {isAddingNewAddress ? (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-medium text-gray-700">Add New Address</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Name
                      </label>
                      <input
                        type="text"
                        value={addressName}
                        onChange={(e) => setAddressName(e.target.value)}
                        placeholder="e.g., Home, Office, Gym"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['home', 'work', 'other'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAddressType(type)}
                            className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                              addressType === type
                                ? 'border-[#FF7A00] bg-orange-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {getAddressIcon(type)}
                            <span className="text-xs font-medium capitalize">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Address
                      </label>
                      <textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter your full address including street, city, and zip code"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddNewAddress}
                      disabled={!newAddress.trim() || !addressName.trim()}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        !newAddress.trim() || !addressName.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white'
                      }`}
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingNewAddress(true)}
                  className="w-full py-3 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] border border-orange-200 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Address
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-full py-3 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Deliver to {currentAddress.name}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Profile Dropdown Modal */}
      {showProfileDropdown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowProfileDropdown(false)}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 right-4 lg:right-8 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile Header */}
            <div className="p-6 bg-gradient-to-r from-[#FF7A00]/10 to-orange-50 border-b border-orange-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF7A00] to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Mail className="w-4 h-4" />
                    {user?.email || 'user@example.com'}
                  </p>
                  {user?.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>
              
              {/* User Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-600">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FF7A00]">Gold</p>
                  <p className="text-xs text-gray-600">Member</p>
                </div>
              </div>
            </div>

            {/* Profile Menu Items */}
            <div className="p-2 max-h-96 overflow-y-auto">
              {profileMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={`/user/${item.id}`}
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-[#FF7A00]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#FF7A00]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF7A00]" />
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                FoodSwift v1.0 • © 2024
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notifications Dropdown Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowNotifications(false)}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 right-4 lg:right-8 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Notifications Header */}
            <div className="p-6 bg-gradient-to-r from-[#FF7A00]/10 to-orange-50 border-b border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <Link
                          to={notification.link}
                          onClick={() => {
                            markAsRead(notification.id);
                            setShowNotifications(false);
                          }}
                          className="flex items-start gap-3"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{notification.time}</span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                notification.type === 'order' ? 'bg-green-100 text-green-800' :
                                notification.type === 'offer' ? 'bg-orange-100 text-orange-800' :
                                notification.type === 'delivery' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.type}
                              </span>
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">No notifications yet</h4>
                  <p className="text-sm text-gray-600">We'll notify you when something arrives</p>
                </div>
              )}
            </div>

            {/* View All Link */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <Link
                  to="/user/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-all duration-200"
                >
                  View all notifications
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative px-4 lg:px-8 pt-8 lg:pt-16 pb-20 lg:pb-28 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://img.freepik.com/premium-photo/cheeseburger-with-side-fries-table_759095-3790.jpg")'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* User Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-white/90 text-sm font-medium">
                  Good afternoon,
                </p>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {user?.name || 'Welcome back'} 👋
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-300"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-300"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                  {activeOrder && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="max-w-2xl space-y-6">
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl lg:text-5xl font-bold text-white leading-tight"
                >
                  Delicious Food,<br />
                  <span className="text-[#FF7A00]">Delivered Fast</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-white/90 leading-relaxed"
                >
                  Order from the best local restaurants with easy on-demand delivery. 
                  Fresh meals at your doorstep in minutes.
                </motion.p>
              </div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-white/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for restaurants or dishes..."
                    className="w-full h-14 pl-12 pr-12 bg-white rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-3 focus:ring-[#FF7A00]/50 border border-transparent hover:border-[#FF7A00]/30 transition-all duration-300 shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF7A00]/20 rounded-lg">
                    <Star className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">4.9</p>
                    <p className="text-sm text-white/80">App Rating</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF7A00]/20 rounded-lg">
                    <Clock className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">25min</p>
                    <p className="text-sm text-white/80">Avg Delivery</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF7A00]/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">500+</p>
                    <p className="text-sm text-white/80">Restaurants</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Active Order Banner */}
        {activeOrder && activeOrder.status !== 'delivered' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link to="/user/tracking">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-green-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center animate-pulse">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">!</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-lg text-gray-900">Order in Progress 🚀</p>
                        <p className="text-sm text-gray-600">
                          {activeOrder.restaurantName} • {activeOrder.status.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
                      >
                        Track Order
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <span className="text-gray-600">
                        Order #ORD{activeOrder.id?.toString().padStart(4, '0')}
                      </span>
                      <span className="font-medium text-green-600">
                        ETA: 25-30 mins
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Search & Filter Results Bar */}
        {(searchQuery || selectedCategory !== 'All' || activeFilters.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-[#FF7A00]/10 to-orange-50 border border-orange-200 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Filter className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border border-orange-200">
                          Search: "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery('')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedCategory !== 'All' && (
                        <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border border-orange-200">
                          Category: {selectedCategory}
                          <button
                            onClick={() => setSelectedCategory('All')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {activeFilters.map(filterId => {
                        const filter = filterOptions.find(f => f.id === filterId);
                        return filter ? (
                          <span key={filterId} className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border border-orange-200">
                            {filter.name}
                            <button
                              onClick={() => handleFilterToggle(filterId)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 transition-all duration-300"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Location Display with Working Change Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#FF7A00]/10 to-orange-100 border border-orange-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shadow-sm ${
                  currentAddress.type === 'current' 
                    ? 'bg-green-100 animate-pulse' 
                    : 'bg-white'
                }`}>
                  {getAddressIcon(currentAddress.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delivering to</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600">{currentAddress.address}</p>
                    {currentAddress.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Default
                      </span>
                    )}
                    {currentAddress.type === 'current' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full animate-pulse">
                        📍 Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="py-2 px-4 border border-[#FF7A00]/30 text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white transition-all duration-300 rounded-lg font-medium flex items-center"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Change Location
                </button>
                <button className="py-2 px-4 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white transition-all duration-300 hover:scale-105 rounded-lg font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Map
                </button>
              </div>
            </div>
            
            {/* Delivery Time Estimate */}
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF7A00]" />
                  <span className="text-sm text-gray-600">Estimated delivery time:</span>
                </div>
                <span className="font-semibold text-gray-900">25-35 minutes</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advanced Filter Options as Dropdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <div className="space-y-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filter Restaurants</h2>
            <p className="text-sm text-gray-600">Refine your search with advanced filters</p>
          </div>
          
          {/* Filter Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl font-medium text-gray-700 flex items-center justify-between gap-3 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#FF7A00]" />
                <span>Filter by Features</span>
                {activeFilters.length > 0 && (
                  <span className="px-2 py-0.5 bg-[#FF7A00] text-white text-xs font-medium rounded-full">
                    {activeFilters.length} selected
                  </span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Filter Dropdown Content */}
            {showFilterDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Select Features</h3>
                    {activeFilters.length > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-[#FF7A00] hover:text-[#FF7A00]/80 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {filterOptions.map((filter) => {
                      const Icon = filter.icon;
                      const isActive = activeFilters.includes(filter.id);
                      return (
                        <button
                          key={filter.id}
                          onClick={() => handleFilterToggle(filter.id)}
                          className={`group p-4 rounded-lg border transition-all duration-200 ${
                            isActive
                              ? 'border-[#FF7A00] bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-lg ${
                              isActive ? 'bg-[#FF7A00]' : 'bg-gray-100 group-hover:bg-orange-100'
                            }`}>
                              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#FF7A00]'}`} />
                            </div>
                            <div className="text-center">
                              <span className={`text-sm font-semibold block ${
                                isActive ? 'text-[#FF7A00]' : 'text-gray-700'
                              }`}>
                                {filter.name}
                              </span>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {filter.description}
                              </span>
                            </div>
                            {isActive && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-[#FF7A00] rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Apply Filters Button */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="w-full py-3 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Selected Filters Display */}
            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.map(filterId => {
                  const filter = filterOptions.find(f => f.id === filterId);
                  return filter ? (
                    <span key={filterId} className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      {filter.name}
                      <button
                        onClick={() => handleFilterToggle(filterId)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </motion.section>

        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                Browse by Cuisine
              </h2>
              <p className="text-sm text-gray-600">
                Explore different food categories
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShowAllCategories}
                className="group flex items-center gap-1 text-[#FF7A00] hover:text-[#FF7A00]/80 font-medium transition-colors w-fit hover:bg-orange-50 px-4 py-2 rounded-lg"
              >
                {showAllCategories ? 'Show Less' : 'See All'}
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* All Categories Button */}
          <div className="mb-4">
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-4 py-2 rounded-lg border transition-all duration-300 ${selectedCategory === 'All' 
                ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#FF7A00]/50 hover:bg-orange-50'
              }`}
            >
              All Cuisines
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {filteredCategories.map(category => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square"
              >
                <button
                  onClick={() => handleCategorySelect(category.name)}
                  className={`group relative block h-full w-full ${selectedCategory === category.name ? 'ring-2 ring-[#FF7A00] ring-offset-2' : ''}`}
                >
                  <div className={cn(
                    'relative h-full flex flex-col items-center justify-center gap-3 p-4 rounded-xl border',
                    'transition-all duration-300 hover:shadow-lg transform hover:scale-105',
                    selectedCategory === category.name ? 'shadow-lg scale-105' : '',
                    category.color
                  )}>
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </span>
                    <span className="text-sm font-semibold text-center">
                      {category.name}
                    </span>
                    {selectedCategory === category.name && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF7A00] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Popular Restaurants Section */}
        {popularRestaurants.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#FF7A00]" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    Popular Near {currentAddress.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Top-rated restaurants near {currentAddress.address.split(',')[0]}
                  </p>
                </div>
              </div>
              <Link 
                to="/user/restaurants" 
                className="group flex items-center gap-2 text-[#FF7A00] hover:text-[#FF7A00]/80 font-medium transition-colors w-fit hover:bg-orange-50 px-4 py-2 rounded-lg"
              >
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {popularRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/user/restaurant/${restaurant.id}`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-2xl transition-all duration-500 hover:border-[#FF7A00]/30">
                      {/* Restaurant Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-semibold border',
                            restaurant.isOpen
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          )}>
                            {restaurant.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                          </span>
                        </div>
                        
                        {/* Feature Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                          {restaurant.deliveryFee === 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              FREE DELIVERY
                            </span>
                          )}
                          {restaurant.deliveryTime <= 30 && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              FAST DELIVERY
                            </span>
                          )}
                        </div>
                        
                        {/* View Details Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-white text-sm font-medium flex items-center gap-2">
                            View Details 
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </p>
                        </div>
                      </div>

                      {/* Restaurant Info */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#FF7A00] transition-colors truncate">
                              {restaurant.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {restaurant.cuisine}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1.5 ml-2 flex-shrink-0">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-gray-900 ml-1">{restaurant.rating}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-100 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{restaurant.deliveryTime} min</span>
                          </div>
                          <div className="text-gray-900 font-semibold">
                            {restaurant.deliveryFee === 0 ? (
                              <span className="text-green-600">Free Delivery</span>
                            ) : (
                              <span>Fee: <span className="text-[#FF7A00]">₹{restaurant.deliveryFee}</span></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All Restaurants Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Utensils className="w-5 h-5 text-[#FF7A00]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">
                  All Restaurants near {currentAddress.name}
                  {selectedCategory !== 'All' && ` - ${selectedCategory}`}
                </h2>
                <p className="text-sm text-gray-600">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'Browse all available restaurants'}
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                  {activeFilters.length > 0 && ' with selected filters'}
                </p>
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                {allRestaurants.length} restaurants {searchQuery || selectedCategory !== 'All' || activeFilters.length > 0 ? 'found' : 'available'}
              </span>
            </div>
          </div>

          {allRestaurants.length > 0 ? (
            <div className="space-y-4">
              {allRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ x: 5 }}
                >
                  <Link to={`/user/restaurant/${restaurant.id}`} className="block">
                    <div className="group bg-white border border-gray-200 hover:border-[#FF7A00]/30 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:shadow-xl transition-all duration-300">
                      {/* Restaurant Image */}
                      <div className="relative flex-shrink-0 sm:w-24 sm:h-24 w-full h-48 sm:h-auto">
                        <div className="w-full h-full rounded-xl overflow-hidden">
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute top-2 right-2 w-2 h-2">
                          <div className={cn(
                            'w-full h-full rounded-full',
                            restaurant.isOpen 
                              ? 'bg-green-500 animate-pulse' 
                              : 'bg-red-500'
                          )}></div>
                        </div>
                      </div>

                      {/* Restaurant Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#FF7A00] transition-colors truncate">
                              {restaurant.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {restaurant.cuisine}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs text-gray-500">Rating</span>
                              <div className="flex items-center gap-1 justify-end">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-gray-900">{restaurant.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {restaurant.deliveryFee === 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Free Delivery
                            </span>
                          )}
                          {restaurant.deliveryTime <= 30 && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              Fast Delivery
                            </span>
                          )}
                          {restaurant.discount && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {restaurant.discount}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{restaurant.deliveryTime} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Delivery:</span>
                              <span className={`font-bold ${restaurant.deliveryFee === 0 ? 'text-green-600' : 'text-[#FF7A00]'}`}>
                                {restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2 sm:mt-0">
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold',
                              restaurant.isOpen
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            )}>
                              {restaurant.isOpen ? 'Open Now' : 'Closed'}
                            </span>
                            <div className="flex items-center gap-2 text-[#FF7A00] font-medium group-hover:gap-3 transition-all duration-300">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Order Now
                              </span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                <Search className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No restaurants found matching "${searchQuery}" near ${currentAddress.name}`
                  : selectedCategory !== 'All'
                  ? `No restaurants found in category "${selectedCategory}" near ${currentAddress.name}`
                  : activeFilters.length > 0
                  ? `No restaurants found with the selected filters near ${currentAddress.name}`
                  : `No restaurants available near ${currentAddress.name}`
                }
              </p>
              <button
                onClick={clearFilters}
                className="py-2 px-6 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-lg font-medium transition-all duration-200"
              >
                Clear Filters & Show All
              </button>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}